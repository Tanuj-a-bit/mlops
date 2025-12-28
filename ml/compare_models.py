import pandas as pd
import os
import pickle

def main():
    print("=== MODEL COMPARISON REPORT ===")
    
    models = ["als", "bpr", "lmf"]
    results = {}
    
    test_path = "data/processed/test_interactions.parquet"
    if not os.path.exists(test_path):
        print("Error: Test data not found. Run training/preprocessing first.")
        return
        
    test_df = pd.read_parquet(test_path)
    
    for model in models:
        model_path = f"models/{model}_model.pkl"
        if os.path.exists(model_path):
            from src.evaluation.metrics import evaluate_model_known_only
            try:
                with open(model_path, "rb") as mp:
                    m = pickle.load(mp)
                res = evaluate_model_known_only(m, test_df, k=10)
                if res:
                    results[model] = res
            except Exception as e:
                print(f"Error evaluating {model}: {e}")

    if results:
        df = pd.DataFrame(results).T
        cols = ["precision@10", "recall@10", "ndcg@10", "hit_rate", "mrr", "map", "user_count"]
        # Ensure only available columns are selected
        available_cols = [c for c in cols if c in df.columns]
        df = df[available_cols]
        print("\n" + df.to_string())
        
        if "hit_rate" in df.columns:
            best_hit = df["hit_rate"].idxmax()
            print(f"\nWINNER (by Hit Rate): {best_hit.upper()}")
    else:
        print("No models found in models/ directory.")

if __name__ == "__main__":
    main()
