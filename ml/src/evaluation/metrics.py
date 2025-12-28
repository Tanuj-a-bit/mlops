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

def f1_at_k(actual, predicted, k=10):
    """
    Computes F1@K.
    """
    p = precision_at_k(actual, predicted, k)
    r = recall_at_k(actual, predicted, k)
    if p + r == 0:
        return 0.0
    return 2 * (p * r) / (p + r)

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

def average_precision_at_k(actual, predicted, k=10):
    """
    Computes Average Precision at K.
    """
    if not actual:
        return 0.0
    
    predicted = predicted[:k]
    score = 0.0
    num_hits = 0.0

    for i, p in enumerate(predicted):
        if p in actual:
            num_hits += 1.0
            score += num_hits / (i + 1.0)

    return score / min(len(actual), k)

def mrr_at_k(actual, predicted, k=10):
    """
    Computes Mean Reciprocal Rank at K.
    """
    if not actual:
        return 0.0
        
    predicted = predicted[:k]
    for i, p in enumerate(predicted):
        if p in actual:
            return 1.0 / (i + 1.0)
    return 0.0

def hit_rate_at_k(actual, predicted, k=10):
    """
    Computes Hit Rate at K.
    """
    if not actual:
        return 0.0
        
    predicted = predicted[:k]
    for p in predicted:
        if p in actual:
            return 1.0
    return 0.0

def evaluate_model_known_only(model, test_interactions, k=10):
    """
    Evaluates a model only for users who are in the model's user map.
    """
    # Group actual items by user
    actual_items = test_interactions.groupby('visitorid')['itemid'].apply(list).to_dict()
    
    train_users = set(model.user_map.keys())
    
    metrics = {
        "precisions": [],
        "recalls": [],
        "f1s": [],
        "ndcgs": [],
        "aps": [],
        "mrrs": [],
        "hits": []
    }
    
    count = 0
    for user_id, actual in actual_items.items():
        if user_id not in train_users:
            continue
            
        count += 1
        # Get recommendations
        predicted = model.recommend(user_id, n=k)
        
        metrics["precisions"].append(precision_at_k(actual, predicted, k))
        metrics["recalls"].append(recall_at_k(actual, predicted, k))
        metrics["f1s"].append(f1_at_k(actual, predicted, k))
        metrics["ndcgs"].append(ndcg_at_k(actual, predicted, k))
        metrics["aps"].append(average_precision_at_k(actual, predicted, k))
        metrics["mrrs"].append(mrr_at_k(actual, predicted, k))
        metrics["hits"].append(hit_rate_at_k(actual, predicted, k))
    
    if count == 0:
        return None
        
    return {
        f"precision@{k}": np.mean(metrics["precisions"]),
        f"recall@{k}": np.mean(metrics["recalls"]),
        f"f1@{k}": np.mean(metrics["f1s"]),
        f"ndcg@{k}": np.mean(metrics["ndcgs"]),
        "map": np.mean(metrics["aps"]),
        "mrr": np.mean(metrics["mrrs"]),
        "hit_rate": np.mean(metrics["hits"]),
        "user_count": count
    }

def run_evaluation(model_type="als"):
    # 1. Load Data
    train_path = "data/processed/train_interactions.parquet"
    test_path = "data/processed/test_interactions.parquet"
    
    if os.path.exists(train_path) and os.path.exists(test_path):
        train_df = pd.read_parquet(train_path)
        test_df = pd.read_parquet(test_path)
    else:
        print("Error: Temporal split data not found. Run preprocessor.py first.")
        return
    
    # 3. Load Model
    model_path = f"models/{model_type}_model.pkl"
    if not os.path.exists(model_path):
        print(f"Error: {model_type} model not found at {model_path}.")
        return
        
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    print(f"Total unique users in test set: {len(test_df['visitorid'].unique())}")
    
    # 4. Evaluate on Known Users
    results = evaluate_model_known_only(model, test_df, k=10)
    
    if results:
        print(f"\n--- Evaluation Results (Returning Users only, n={results['user_count']}) ---")
        for metric, value in results.items():
            if metric != "user_count":
                print(f"{metric}: {value:.4f}")
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
            if metric != "user_count":
                print(f"{metric}: {value:.4f}")
    else:
        print("No results.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--random", action="store_true")
    parser.add_argument("--model-type", type=str, default="als")
    args = parser.parse_args()
    
    if args.random:
        run_random_split_evaluation()
    else:
        run_evaluation(model_type=args.model_type)
