from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time
import pickle
import os
from src.monitoring.prometheus_metrics import track_request, record_latency, start_metrics_server

app = FastAPI(title="Recommendation System API")

# Load model at startup
MODEL_PATH = "models/als_model.pkl"
model = None

@app.on_event("startup")
async def startup_event():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            print(f"Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Warning: Model file not found at {MODEL_PATH}. Using fallback.")
    
    # Start Prometheus metrics server on a different port
    start_metrics_server(port=8081)

class PredictionRequest(BaseModel):
    user_id: int
    n: int = 10

class PredictionResponse(BaseModel):
    user_id: int
    recommendations: list[int]

@app.post("/recommend", response_model=PredictionResponse)
async def recommend(request: PredictionRequest):
    start_time = time.time()
    
    # Track metrics
    track_request()
    
    try:
        if model:
            # The ALSRecommender.recommend method returns item IDs
            recommendations = model.recommend(request.user_id, n=request.n)
        else:
            # Fallback mock recommendations
            recommendations = [100 + i for i in range(request.n)]
        
        duration = time.time() - start_time
        record_latency(duration)
        
        return PredictionResponse(
            user_id=request.user_id,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}
