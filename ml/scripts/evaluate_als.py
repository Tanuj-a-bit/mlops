import pandas as pd
import pickle
import os
from src.evaluation.metrics import evaluate_model

def run_evaluation():
    # 1. Load Data
    data_path = "data/processed/interactions.parquet"
    if not os.path.exists(data_path):
        print("Error: Interaction data not found.")
        return
    
    df = pd.read_parquet(data_path)
    
    # 2. Split (must match trainer)
    train_size = int(len(df) * 0.8)
    test_df = df.iloc[train_size:]
    
    # 3. Load Model
    model_path = "models/als_model.pkl"
    if not os.path.exists(model_path):
        print("Error: ALS model not found.")
        return
        
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    print(f"Evaluating model on {len(test_df['visitorid'].unique())} unique users in test set...")
    
    # 4. Check coverage
    test_users = test_df['visitorid'].unique()
    train_users_in_model = set(model.user_map.keys())
    known_users = [u for u in test_users if u in train_users_in_model]
    coverage = len(known_users) / len(test_users)
    print(f"User Coverage (users in test set that were in training): {coverage:.2%}")

    # 5. Evaluate
    results = evaluate_model(model, test_df, k=10)
    
    print("\n--- Evaluation Results ---")
    for metric, value in results.items():
        print(f"{metric}: {value:.4f}")

if __name__ == "__main__":
    run_evaluation()
