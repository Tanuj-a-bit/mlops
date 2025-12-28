from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time
import pickle
import os
from src.monitoring.prometheus_metrics import (
    track_request, 
    record_latency, 
    track_error, 
    track_timeout, 
    record_feedback,
    start_metrics_server
)

app = FastAPI(title="BPR Recommendation Service")

MODEL_PATH = "models/bpr_model.pkl"
model = None

@app.on_event("startup")
async def startup_event():
    global model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print(f"BPR Model loaded from {MODEL_PATH}")
    start_metrics_server(port=8082) # Different port for BPR if needed

class PredictionRequest(BaseModel):
    user_id: int
    n: int = 10

class PredictionResponse(BaseModel):
    user_id: int
    recommendations: list[int]
    latency: float

@app.post("/recommend", response_model=PredictionResponse)
async def recommend(request: PredictionRequest):
    start_time = time.time()
    track_request()
    try:
        if model:
            recommendations = model.recommend(request.user_id, n=request.n)
        else:
            recommendations = [200 + i for i in range(request.n)]
        
        duration = time.time() - start_time
        record_latency(duration)
        if duration > 0.5: track_timeout()
        return PredictionResponse(user_id=request.user_id, recommendations=recommendations, latency=duration)
    except Exception as e:
        track_error()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "healthy", "model": "bpr", "loaded": model is not None}
