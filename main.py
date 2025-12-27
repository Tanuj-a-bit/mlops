import argparse
import sys
import os

def main():
    parser = argparse.ArgumentParser(description="Recommendation MLOps CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Train command
    train_parser = subparsers.add_parser("train", help="Train the recommendation model")
    
    # Evaluate command
    eval_parser = subparsers.add_parser("evaluate", help="Evaluate the model performance")
    eval_parser.add_argument("--random", action="store_true", help="Use random split for evaluation")

    # Drift command
    drift_parser = subparsers.add_parser("drift", help="Run data drift analysis")

    args = parser.parse_args()

    if args.command == "train":
        from src.training.trainer import main as run_train
        # Default config from trainer.py
        config = {
            "model_type": "als",
            "min_interactions": 10,
            "factors": 100,
            "regularization": 0.05,
            "iterations": 30
        }
        run_train(config)

    elif args.command == "evaluate":
        from src.evaluation.metrics import run_evaluation, run_random_split_evaluation
        if args.random:
            run_random_split_evaluation()
        else:
            run_evaluation()

    elif args.command == "drift":
        import pandas as pd
        from src.monitoring.drift_detector import DriftDetector
        data_path = "data/processed/interactions.parquet"
        if os.path.exists(data_path):
            df = pd.read_parquet(data_path)
            split_idx = int(len(df) * 0.8)
            ref_df = df.iloc[:split_idx]
            curr_df = df.iloc[split_idx:]
            detector = DriftDetector()
            detector.run_drift_analysis(ref_df, curr_df)
        else:
            print("Error: Interaction data not found. Run 'python main.py train' first.")

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
