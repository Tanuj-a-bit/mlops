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
    start_metrics_server
)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="LMF Recommendation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/lmf_model.pkl"
model = None

@app.on_event("startup")
async def startup_event():
    global model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print(f"LMF Model loaded from {MODEL_PATH}")
    start_metrics_server(port=8083) # Different port for LMF

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
            recommendations = [300 + i for i in range(request.n)]
        
        duration = time.time() - start_time
        record_latency(duration)
        if duration > 0.5: track_timeout()
        return PredictionResponse(user_id=request.user_id, recommendations=recommendations, latency=duration)
    except Exception as e:
        track_error()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "healthy", "model": "lmf", "loaded": model is not None}
