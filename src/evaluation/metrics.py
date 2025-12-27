import numpy as np
import os
import pickle
import pandas as pd

print("DEBUG: metrics.py loaded")

def precision_at_k(actual, predicted, k=10):
    """
    Computes Precision@K.
    """
    if not actual:
        return 0.0
    
    predicted = predicted[:k]
    relevant = [p for p in predicted if p in actual]
    return len(relevant) / k

def recall_at_k(actual, predicted, k=10):
    """
    Computes Recall@K.
    """
    if not actual:
        return 0.0
    
    predicted = predicted[:k]
    relevant = [p for p in predicted if p in actual]
    return len(relevant) / len(actual)

def ndcg_at_k(actual, predicted, k=10):
    """
    Computes Normalized Discounted Cumulative Gain at K.
    """
    if not actual:
        return 0.0
    
    predicted = predicted[:k]
    dcg = 0.0
    for i, p in enumerate(predicted):
        if p in actual:
            dcg += 1.0 / np.log2(i + 2)
            
    # IDCG is 1 + 1/log2(2) + ... up to min(len(actual), k)
    idcg = 0.0
    for i in range(min(len(actual), k)):
        idcg += 1.0 / np.log2(i + 2)
        
    return dcg / idcg if idcg > 0 else 0.0

def evaluate_model_known_only(model, test_interactions, k=10):
    """
    Evaluates a model only for users who are in the model's user map.
    """
    # Group actual items by user
    actual_items = test_interactions.groupby('visitorid')['itemid'].apply(list).to_dict()
    
    train_users = set(model.user_map.keys())
    
    precisions = []
    recalls = []
    ndcgs = []
    
    count = 0
    for user_id, actual in actual_items.items():
        if user_id not in train_users:
            continue
            
        count += 1
        # Get recommendations
        predicted = model.recommend(user_id, n=k)
        
        precisions.append(precision_at_k(actual, predicted, k))
        recalls.append(recall_at_k(actual, predicted, k))
        ndcgs.append(ndcg_at_k(actual, predicted, k))
    
    if count == 0:
        return None
        
    return {
        f"precision@{k}": np.mean(precisions),
        f"recall@{k}": np.mean(recalls),
        f"ndcg@{k}": np.mean(ndcgs),
        "user_count": count
    }

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
        
    print(f"Total unique users in test set: {len(test_df['visitorid'].unique())}")
    
    # 4. Evaluate on Known Users
    results = evaluate_model_known_only(model, test_df, k=10)
    
    if results:
        print(f"\n--- Evaluation Results (Returning Users only, n={results['user_count']}) ---")
        print(f"precision@10: {results['precision@10']:.4f}")
        print(f"recall@10: {results['recall@10']:.4f}")
        print(f"ndcg@10: {results['ndcg@10']:.4f}")
    else:
        print("\nNo known users found in test set.")

def run_random_split_evaluation(sample_size=2000):
    """
    Performs a random split evaluation on a sample of users to get 
    metrics for known users.
    """
    # 1. Load Data
    data_path = "data/processed/interactions.parquet"
    if not os.path.exists(data_path):
        return
    
    df = pd.read_parquet(data_path)
    
    # 2. Get users with enough interactions
    user_counts = df.groupby('visitorid').size()
    eligible_users = user_counts[user_counts >= 5].index.tolist()
    
    if len(eligible_users) > sample_size:
        import random
        random.seed(42)
        eligible_users = random.sample(eligible_users, sample_size)
    
    print(f"Running random split evaluation for {len(eligible_users)} users...")
    
    # 3. For each user, split interactions 80/20 randomly
    train_data = []
    test_data = []
    
    for user_id in eligible_users:
        user_interactions = df[df['visitorid'] == user_id]
        n_train = int(len(user_interactions) * 0.8)
        
        # Shuffle
        user_interactions = user_interactions.sample(frac=1, random_state=42)
        train_data.append(user_interactions.iloc[:n_train])
        test_data.append(user_interactions.iloc[n_train:])
        
    train_df = pd.concat(train_data)
    test_df = pd.concat(test_data)
    
    # 4. Train a temporary model
    from src.models.collaborative_filtering import ALSRecommender
    model = ALSRecommender(factors=100, regularization=0.05, iterations=30)
    model.train(train_df)
    
    # 5. Evaluate
    results = evaluate_model_known_only(model, test_df, k=10)
    
    print("\n--- Random Split Evaluation Results (Returning Users) ---")
    if results:
        for metric, value in results.items():
            print(f"{metric}: {value:.4f}")
    else:
        print("No results.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--random":
        run_random_split_evaluation()
    else:
        run_evaluation()
