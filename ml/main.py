import argparse
import sys
import os
import subprocess

from dotenv import load_dotenv

# Determine the base 'ml' directory (where this script resides)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

# Load environment variables from .env
load_dotenv(os.path.join(BASE_DIR, ".env"))

def main():
    parser = argparse.ArgumentParser(description="Recommendation System ML Registry & Pipeline")
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Train subparser
    train_parser = subparsers.add_parser("train", help="Train a model")
    train_parser.add_argument("--model", choices=["als", "bpr", "lmf"], default="als", help="Model type")
    train_parser.add_argument("--factors", type=int, help="Override default factors")
    train_parser.add_argument("--iterations", type=int, help="Override default iterations")
    train_parser.add_argument("--regularization", type=float, help="Override default regularization")
    train_parser.add_argument("--learning-rate", type=float, help="Override default learning rate")
    train_parser.add_argument("--resume", action="store_true", help="Resume from checkpoint")

    # Evaluate subparser
    eval_parser = subparsers.add_parser("evaluate", help="Evaluate models")
    eval_parser.add_argument("--model", choices=["als", "bpr", "lmf", "all"], default="all", help="Model to evaluate")

    # Serve subparser
    serve_parser = subparsers.add_parser("serve", help="Serve a model")
    serve_parser.add_argument("--model", choices=["als", "bpr", "lmf"], default="als", help="Model to serve")
    serve_parser.add_argument("--port", type=int, default=8000, help="Port to serve on")

    # Comparison subparser
    compare_parser = subparsers.add_parser("compare", help="Compare all models")

    # Drift subparser
    drift_parser = subparsers.add_parser("drift", help="Run data drift analysis")
    drift_parser.add_argument("--model", choices=["als", "bpr", "lmf"], default="als", help="Model to analyze")

    args = parser.parse_args()

    if args.command == "train":
        script = f"src/training/{args.model}_trainer.py"
        cmd = ["python", script]
        if args.factors: cmd.extend(["--factors", str(args.factors)])
        if args.iterations: cmd.extend(["--iterations", str(args.iterations)])
        if args.regularization: cmd.extend(["--regularization", str(args.regularization)])
        if args.learning_rate: cmd.extend(["--learning-rate", str(args.learning_rate)])
        if args.resume: cmd.append("--resume")
        print(f"Executing: {' '.join(cmd)}")
        # Run from the 'ml' directory to ensure relative paths like 'data/' work
        subprocess.run(cmd, cwd=BASE_DIR)

    elif args.command == "evaluate":
        if args.model == "all":
            models = ["als", "bpr", "lmf"]
        else:
            models = [args.model]
        
        for m in models:
            print(f"\n>>> Evaluating {m.upper()} Model")
            subprocess.run(["python", "src/evaluation/metrics.py", "--model-type", m], cwd=BASE_DIR)

    elif args.command == "serve":
        app_path = f"src.serving.{args.model}_app:app"
        print(f"Starting {args.model.upper()} service on port {args.port}...")
        subprocess.run(["uvicorn", app_path, "--host", "0.0.0.0", "--port", str(args.port)], cwd=BASE_DIR)

    elif args.command == "compare":
        subprocess.run(["python", "compare_models.py"], cwd=BASE_DIR)

    elif args.command == "drift":
        print(f"\n>>> Running Drift Analysis for {args.model.upper()}...")
        subprocess.run(["python", "src/monitoring/drift_detector.py"], cwd=BASE_DIR)

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
