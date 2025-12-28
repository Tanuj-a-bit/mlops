import os
import argparse
import wandb
import mlflow
import mlflow.sklearn
import pandas as pd
import pickle
from datetime import datetime
from src.data.loader import DataLoader
from src.data.preprocessor import Preprocessor
from src.models.bpr import BPRRecommender

def main(config):
    os.environ["WANDB_CONFIG_DIR"] = os.path.abspath(".wandb_config")
    
    wandb.init(project="recommendation-mlops-bpr", config=config)
    mlflow.set_tracking_uri("file:./mlruns")
    mlflow.set_experiment("bpr-recommendation")
    
    with mlflow.start_run(run_name=f"BPR-{datetime.now().strftime('%Y%m%d-%H%M%S')}"):
        print("\n=== BPR Training: Logging Hyperparameters ===")
        mlflow.log_params(config)
        
        train_path = "data/processed/train_interactions.parquet"
        test_path = "data/processed/test_interactions.parquet"
        
        if os.path.exists(train_path) and os.path.exists(test_path):
            train_df = pd.read_parquet(train_path)
            test_df = pd.read_parquet(test_path)
        else:
            print("\nProcessed temporal splits not found. Running preprocessor...")
            loader = DataLoader()
            events = loader.load_events()
            preprocessor = Preprocessor(min_interactions=config.get('min_interactions', 10))
            cleaned_events = preprocessor.clean_events(events)
            train_events, test_events = preprocessor.temporal_split(cleaned_events)
            train_df = preprocessor.create_interaction_weights(train_events)
            test_df = preprocessor.create_interaction_weights(test_events)
            os.makedirs("data/processed", exist_ok=True)
            train_df.to_parquet(train_path)
            test_df.to_parquet(test_path)

        dataset_stats = {
            "train_samples": len(train_df),
            "test_samples": len(test_df),
            "unique_users": train_df['visitorid'].nunique(),
            "unique_items": train_df['itemid'].nunique(),
        }
        for k, v in dataset_stats.items(): mlflow.log_metric(f"dataset_{k}", v)

        print(f"\n=== Training BPR model ===")
        model_path = "models/bpr_model.pkl"
        should_resume = config.get('resume', False)
        model = None
        
        if should_resume and os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            if model.factors != config['factors']:
                model = None
            else:
                model.regularization = config['regularization']
                model.iterations = config['iterations']
                if hasattr(model, 'model'):
                    model.model.regularization = config['regularization']
                    model.model.iterations = config['iterations']

        if model is None:
            model = BPRRecommender(
                factors=config['factors'], 
                regularization=config['regularization'], 
                iterations=config['iterations'],
                learning_rate=config.get('learning_rate', 0.01)
            )
        else:
            # Update parameters if resuming
            model.regularization = config['regularization']
            model.iterations = config['iterations']
            model.learning_rate = config.get('learning_rate', 0.01)
            if hasattr(model, 'model'):
                model.model.regularization = config['regularization']
                model.model.iterations = config['iterations']
                model.model.learning_rate = config.get('learning_rate', 0.01)
        
        model.train(train_df)
        os.makedirs("models", exist_ok=True)
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)

        from src.evaluation.metrics import evaluate_model_known_only
        eval_results = evaluate_model_known_only(model, test_df, k=10)
        
        if eval_results:
            for key, value in eval_results.items():
                if isinstance(value, (int, float)) and key != "user_count":
                    mlflow.log_metric(key.replace("@", "_at_"), value)
            wandb.log(eval_results)

        mlflow.log_artifact(model_path, artifact_path="model")
        print(f"BPR Training Completed. Model saved to {model_path}")
        wandb.finish()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--factors", type=int, default=100)
    parser.add_argument("--iterations", type=int, default=50)
    parser.add_argument("--regularization", type=float, default=0.01)
    parser.add_argument("--learning-rate", type=float, default=0.01)
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()
    
    config = vars(args)
    config["model_type"] = "bpr"
    main(config)
