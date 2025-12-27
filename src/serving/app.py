import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from scipy.sparse import load_npz

# -----------------------------
# Load model and artifacts
# -----------------------------
try:
    with open("data/processed/als_model.pkl", "rb") as f:
        model = pickle.load(f)

    with open("data/processed/user_id_map.pkl", "rb") as f:
        user_id_map = pickle.load(f)

    with open("data/processed/item_id_map.pkl", "rb") as f:
        item_id_map = pickle.load(f)

    # Ensure CSR format for efficient slicing and implicit compatibility
    user_item_matrix = load_npz("data/processed/user_item_matrix.npz").tocsr()

except FileNotFoundError as e:
    print(f"Error loading artifacts: {e}")
    # In a real app, you might want to exit or handle this gracefully
    model = None
    user_id_map = {}
    item_id_map = {}
    user_item_matrix = None

# Reverse mapping for item IDs
if item_id_map:
    item_idx_to_id = {v: k for k, v in item_id_map.items()}
else:
    item_idx_to_id = {}

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Product Recommendation API")

# -----------------------------
# Health check
# -----------------------------
@app.get("/")
def health():
    return {"status": "API is running"}

# -----------------------------
# Recommendation endpoint
# -----------------------------
@app.get("/recommend")
def recommend(user_id: int, n: int = 5):
    if model is None:
         raise HTTPException(status_code=503, detail="Model not loaded")

    if user_id not in user_id_map:
        raise HTTPException(status_code=404, detail="User not found")

    user_idx = user_id_map[user_id]

    # Pass the specific user's row to implicit's recommend
    # implicit 0.7.x returns (item_indices, scores) tuple of arrays
    ids, scores = model.recommend(
        userid=user_idx,
        user_items=user_item_matrix[user_idx],
        N=n
    )

    result = []
    for i in range(len(ids)):
        result.append({
            "item_id": int(item_idx_to_id[ids[i]]), # Convert to native int for JSON
            "score": float(scores[i])               # Convert to native float for JSON
        })

    return {
        "user_id": user_id,
        "recommendations": result
    }
