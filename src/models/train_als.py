import pickle
import numpy as np
from scipy.sparse import load_npz
from implicit.als import AlternatingLeastSquares
import wandb

# -----------------------------
# Initialize W&B
# -----------------------------
wandb.init(
    project="product-recommendation-mlops",
    name="als-baseline",
    config={
        "model": "ALS",
        "factors": 50,
        "regularization": 0.01,
        "iterations": 20
    }
)

config = wandb.config

# -----------------------------
# Load feature artifacts
# -----------------------------
# Implicit expects CSR for efficiency, and load_npz might return COO.
# We convert to CSR here to match implicit's preference and avoid warnings/errors.
user_item_matrix = load_npz("data/processed/user_item_matrix.npz").tocsr()

with open("data/processed/user_id_map.pkl", "rb") as f:
    user_id_map = pickle.load(f)

with open("data/processed/item_id_map.pkl", "rb") as f:
    item_id_map = pickle.load(f)

# -----------------------------
# Train ALS model
# -----------------------------
model = AlternatingLeastSquares(
    factors=config.factors,
    regularization=config.regularization,
    iterations=config.iterations,
    random_state=42
)

wandb.log({"status": "training_started"})
print("Training ALS model...")
model.fit(user_item_matrix)
wandb.log({"status": "training_completed"})

print("Training completed.")

# -----------------------------
# Save trained model
# -----------------------------
model_path = "data/processed/als_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(model, f)

print(f"Model saved to {model_path}")

# -----------------------------
# Log model as W&B artifact
# -----------------------------
artifact = wandb.Artifact(
    name="als-recommendation-model",
    type="model",
    description="ALS collaborative filtering model"
)
artifact.add_file(model_path)
wandb.log_artifact(artifact)

# -----------------------------
# Sanity check recommendation
# -----------------------------
sample_user = list(user_id_map.values())[0]
recs = model.recommend(
    userid=sample_user,
    user_items=user_item_matrix[sample_user],
    N=5
)

wandb.log({
    "sample_recommendation_count": len(recs)
})

print("Sample recommendations (item_idx, score):")
print(recs)

wandb.finish()
