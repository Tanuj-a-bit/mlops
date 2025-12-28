from fastapi import FastAPI, HTTPException, BackgroundTasks
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
    
    # Start Prometheus metrics server on port 8081
    start_metrics_server(port=8081)

class PredictionRequest(BaseModel):
    user_id: int
    n: int = 10

class PredictionResponse(BaseModel):
    user_id: int
    recommendations: list[int]
    latency: float

class FeedbackRequest(BaseModel):
    event_type: str  # click, conversion, add_to_cart, bounce, dwell_time
    user_id: int
    item_id: int
    value: float = None

@app.post("/recommend", response_model=PredictionResponse)
async def recommend(request: PredictionRequest):
    start_time = time.time()
    track_request()
    
    try:
        if model:
            # ALSRecommender.recommend
            recommendations = model.recommend(request.user_id, n=request.n)
        else:
            # Fallback mock recommendations
            recommendations = [100 + i for i in range(request.n)]
        
        duration = time.time() - start_time
        record_latency(duration)
        
        # Simulate a timeout check (e.g., if duration > 0.5s)
        if duration > 0.5:
            track_timeout()
            
        return PredictionResponse(
            user_id=request.user_id,
            recommendations=recommendations,
            latency=duration
        )
    except Exception as e:
        track_error()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def feedback(request: FeedbackRequest):
    """
    Endpoint to receive user feedback and update business metrics.
    """
    record_feedback(request.event_type, request.value)
    return {"status": "success", "message": f"Recorded {request.event_type}"}

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}
