import wandb
import os
from src.training.trainer import main as train_fn

# Set WANDB_CONFIG_DIR to a local project directory to avoid permission issues with ~/.config
os.makedirs(".wandb_config", exist_ok=True)
os.environ["WANDB_CONFIG_DIR"] = os.path.abspath(".wandb_config")

def sweep_train():
    """
    Function to be called by the WandB sweep agent.
    """
    with wandb.init() as run:
        config = run.config
        
        # Merge sweep config with default training parameters
        train_config = {
            "model_type": "als",
            "min_interactions": 10,
            "factors": config.factors,
            "regularization": config.regularization,
            "iterations": config.iterations
        }
        
        # Execute training with these hyperparameters
        train_fn(train_config)

def run_tuning():
    """
    Configures and starts a hyperparameter sweep using WandB.
    """
    sweep_config = {
        'method': 'random', # or grid, bayes
        'metric': {
            'name': 'ndcg@10',
            'goal': 'maximize'   
        },
        'parameters': {
            'factors': {
                'values': [50, 100, 150]
            },
            'regularization': {
                'values': [0.01, 0.05, 0.1]
            },
            'iterations': {
                'values': [10, 15, 20]
            }
        }
    }
    
    sweep_id = wandb.sweep(sweep_config, project="recommendation-mlops-tuning")
    wandb.agent(sweep_id, function=sweep_train, count=5)

if __name__ == "__main__":
    print("Starting Hyperparameter Tuning...")
    run_tuning()
