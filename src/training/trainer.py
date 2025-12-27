import os
import argparse
import wandb
import pandas as pd
import pickle
from src.data.loader import DataLoader
from src.data.preprocessor import Preprocessor
from src.models.collaborative_filtering import ALSRecommender
from src.models.baseline import PopularityRecommender

def main(config):
    # Set WANDB_CONFIG_DIR to a local project directory to avoid permission issues with ~/.config
    os.environ["WANDB_CONFIG_DIR"] = os.path.abspath(".wandb_config")
    
    # 1. Initialize Experiment Tracking
    wandb.init(project="recommendation-mlops", config=config)
    
    # 2. Load Processed Data
    input_path = "data/processed/interactions.parquet"
    if os.path.exists(input_path):
        print(f"Loading processed data from {input_path}...")
        interactions = pd.read_parquet(input_path)
    else:
        print("Processed data not found. Running full pipeline (Loader -> Preprocessor)...")
        loader = DataLoader()
        events = loader.load_events()
        preprocessor = Preprocessor(min_interactions=config['min_interactions'])
        cleaned_events = preprocessor.clean_events(events)
        interactions = preprocessor.create_interaction_weights(cleaned_events)
        
        # Save processed data for evaluation script
        os.makedirs(os.path.dirname(input_path), exist_ok=True)
        interactions.to_parquet(input_path)
        print(f"Saved processed interactions to {input_path}")
    
    # Random Split for Personalized Recommendation Evaluation
    from sklearn.model_selection import train_test_split
    train_df, test_df = train_test_split(interactions, test_size=0.2, random_state=42)
    
    # 4. Train Model
    print(f"Training {config['model_type']} model...")
    if config['model_type'] == 'als':
        model = ALSRecommender(
            factors=config['factors'], 
            regularization=config['regularization'], 
            iterations=config['iterations']
        )
        model.train(train_df)
    else:
        model = PopularityRecommender()
        model.train(train_df)
        
    # 5. Save Model
    os.makedirs("models", exist_ok=True)
    model_path = f"models/{config['model_type']}_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to {model_path}")

    # 6. Evaluate
    print("Evaluating model...")
    from src.evaluation.metrics import evaluate_model_known_only
    eval_results = evaluate_model_known_only(model, test_df, k=10)
    
    # 7. Logging to WandB
    log_dict = {
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "unique_users": interactions['visitorid'].nunique(),
        "unique_items": interactions['itemid'].nunique()
    }
    
    if eval_results:
        log_dict.update(eval_results)
        print(f"Evaluation Results: {eval_results}")
    
    wandb.log(log_dict)
    
    print("Training Complete.")
    wandb.finish()

if __name__ == "__main__":
    config = {
        "model_type": "als",
        "min_interactions": 10,
        "factors": 100,
        "regularization": 0.05,
        "iterations": 30
    }
    main(config)
