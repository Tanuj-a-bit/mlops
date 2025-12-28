# 📊 MLflow Metrics Logging Guide

## Overview

All metrics from the recommendation system are automatically logged to **MLflow** during model training. This provides a centralized location for tracking experiments, comparing models, and analyzing performance.

---

## 🎯 What Gets Logged to MLflow

### 1. **Hyperparameters** (Parameters)

All model configuration parameters are logged:

```python
{
    "model_type": "als",
    "min_interactions": 10,
    "factors": 100,
    "regularization": 0.05,
    "iterations": 30
}
```

**MLflow Function**: `mlflow.log_params(config)`

---

### 2. **Dataset Statistics** (Metrics)

Comprehensive dataset information:

| Metric | Description | Example Value |
|--------|-------------|---------------|
| `dataset_total_interactions` | Total number of user-item interactions | 317,610 |
| `dataset_unique_users` | Number of unique users | 23,825 |
| `dataset_unique_items` | Number of unique items | 48,190 |
| `dataset_sparsity` | Data sparsity (1 - density) | 0.9997 |
| `dataset_avg_interactions_per_user` | Average interactions per user | 13.33 |
| `dataset_avg_interactions_per_item` | Average interactions per item | 6.59 |

**MLflow Function**: `mlflow.log_metric(f"dataset_{key}", value)`

---

### 3. **Train/Test Split Information** (Metrics)

| Metric | Description |
|--------|-------------|
| `train_samples` | Number of training samples |
| `test_samples` | Number of test samples |
| `train_test_ratio` | Ratio of train to test size |

---

### 4. **Offline Evaluation Metrics** (Metrics)

All 7 recommendation quality metrics:

| Metric | MLflow Key | Description | Target |
|--------|-----------|-------------|--------|
| Precision@10 | `precision@10` | Fraction of relevant items in top-10 | > 0.25 |
| Recall@10 | `recall@10` | Fraction of relevant items retrieved | > 0.30 |
| F1@10 | `f1@10` | Harmonic mean of P&R | > 0.25 |
| NDCG@10 | `ndcg@10` | Position-aware ranking quality | > 0.40 |
| MAP | `map` | Mean Average Precision | > 0.30 |
| MRR | `mrr` | Mean Reciprocal Rank | > 0.65 |
| Hit Rate@10 | `hit_rate` | % users with ≥1 relevant item | > 0.85 |

**Additional Metrics**:
- `evaluated_users` - Number of users evaluated
- `precision_at_10` - Duplicate for clarity
- `recall_at_10` - Duplicate for clarity
- `item_coverage_estimate` - Estimated item catalog coverage

**MLflow Function**: `mlflow.log_metric(key, value)`

---

### 5. **Model Artifacts**

Files saved to MLflow:

| Artifact | Path | Description |
|----------|------|-------------|
| Model File | `model/als_model.pkl` | Trained ALS model (pickle) |
| Dataset Info | `info/dataset_info.txt` | Text summary of stats & metrics |

**MLflow Function**: `mlflow.log_artifact(path, artifact_path)`

---

## 🚀 Running Training with MLflow

### Basic Training

```bash
# Run training (automatically logs to MLflow)
uv run python src/training/trainer.py
```

**Output Example**:
```
=== Logging Hyperparameters to MLflow ===
  model_type: als
  min_interactions: 10
  factors: 100
  regularization: 0.05
  iterations: 30

=== Logging Dataset Statistics to MLflow ===
  total_interactions: 317610
  unique_users: 23825
  unique_items: 48190
  sparsity: 0.9997
  avg_interactions_per_user: 13.3333
  avg_interactions_per_item: 6.5900

Train samples: 254088
Test samples: 63522

=== Training als model ===
Model training completed!

=== Evaluating Model ===

=== Logging All Metrics to MLflow ===
  ✓ precision@10: 0.2838
  ✓ recall@10: 0.3609
  ✓ f1@10: 0.2737
  ✓ ndcg@10: 0.4637
  ✓ map: 0.3288
  ✓ mrr: 0.7681
  ✓ hit_rate: 0.9452
  ✓ evaluated_users: 4729

=== Logging Artifacts to MLflow ===
  ✓ Model artifact: models/als_model.pkl
  ✓ Dataset info: models/dataset_info.txt

============================================================
TRAINING SUMMARY
============================================================
Model Type: als
MLflow Run ID: abc123def456...
MLflow Experiment: recommendation-system

All metrics have been logged to MLflow!
View results: mlflow ui
============================================================
```

---

## 📊 Viewing Results in MLflow UI

### Start MLflow UI

```bash
# From project root
mlflow ui

# Or specify port
mlflow ui --port 5000
```

**Access**: http://localhost:5000

### MLflow UI Features

1. **Experiments View**
   - See all runs for "recommendation-system" experiment
   - Compare metrics across runs
   - Sort by any metric (precision, recall, etc.)

2. **Run Details**
   - View all parameters and metrics
   - Download model artifacts
   - See run metadata (start time, duration, etc.)

3. **Compare Runs**
   - Select multiple runs
   - Compare metrics side-by-side
   - Visualize metric trends

4. **Model Registry** (Optional)
   - Register best models
   - Version control
   - Stage transitions (Staging → Production)

---

## 🔍 Querying MLflow Programmatically

### Search Runs

```python
import mlflow

# Set experiment
mlflow.set_experiment("recommendation-system")

# Search for runs
runs = mlflow.search_runs(
    experiment_names=["recommendation-system"],
    order_by=["metrics.ndcg@10 DESC"],
    max_results=10
)

# View results
print(runs[["run_id", "metrics.precision@10", "metrics.recall@10", "metrics.ndcg@10"]])
```

### Load Best Model

```python
import mlflow

# Get best run by NDCG
best_run = mlflow.search_runs(
    experiment_names=["recommendation-system"],
    order_by=["metrics.ndcg@10 DESC"],
    max_results=1
).iloc[0]

# Load model
model_uri = f"runs:/{best_run.run_id}/model/als_model.pkl"
# Note: For pickle files, you'll need to download and load manually
```

---

## 📈 Metric Comparison Example

### Compare Multiple Runs

```python
import mlflow
import pandas as pd

# Get all runs
runs = mlflow.search_runs(experiment_names=["recommendation-system"])

# Select key metrics
metrics_df = runs[[
    "run_id",
    "params.factors",
    "params.regularization",
    "metrics.precision@10",
    "metrics.recall@10",
    "metrics.ndcg@10",
    "metrics.map",
    "metrics.mrr"
]]

# Sort by NDCG
metrics_df = metrics_df.sort_values("metrics.ndcg@10", ascending=False)
print(metrics_df.head(10))
```

---

## 🎯 Complete Metrics List in MLflow

### Parameters (6)
- `model_type`
- `min_interactions`
- `factors`
- `regularization`
- `iterations`

### Metrics (20+)

**Dataset Metrics (6)**:
- `dataset_total_interactions`
- `dataset_unique_users`
- `dataset_unique_items`
- `dataset_sparsity`
- `dataset_avg_interactions_per_user`
- `dataset_avg_interactions_per_item`

**Split Metrics (3)**:
- `train_samples`
- `test_samples`
- `train_test_ratio`

**Evaluation Metrics (11)**:
- `precision@10`
- `recall@10`
- `f1@10`
- `ndcg@10`
- `map`
- `mrr`
- `hit_rate`
- `evaluated_users`
- `precision_at_10` (duplicate)
- `recall_at_10` (duplicate)
- `item_coverage_estimate`

### Artifacts (2)
- `model/als_model.pkl`
- `info/dataset_info.txt`

---

## 🔄 Integration with Other Tools

### MLflow + WandB

Both tools are used simultaneously:
- **MLflow**: Centralized experiment tracking, model registry
- **WandB**: Rich visualizations, collaboration features

```python
# Both are logged in trainer.py
mlflow.log_metric("precision@10", value)  # MLflow
wandb.log({"precision@10": value})        # WandB
```

### MLflow + Prometheus

- **MLflow**: Offline metrics (training time)
- **Prometheus**: Online metrics (serving time)

---

## 📝 Dataset Info Artifact

The `dataset_info.txt` artifact contains:

```
Dataset Statistics
==================================================
total_interactions: 317610
unique_users: 23825
unique_items: 48190
sparsity: 0.9997268...
avg_interactions_per_user: 13.333...
avg_interactions_per_item: 6.590...

Evaluation Results
==================================================
precision@10: 0.2838
recall@10: 0.3609
f1@10: 0.2737
ndcg@10: 0.4637
map: 0.3288
mrr: 0.7681
hit_rate: 0.9452
user_count: 4729
```

---

## 🎓 Best Practices

1. **Consistent Naming**: Use the same metric names across runs
2. **Tag Runs**: Add tags for easy filtering (e.g., "production", "experiment")
3. **Log Early**: Log parameters at the start of the run
4. **Log Often**: Log metrics as they're computed
5. **Save Artifacts**: Always save the model and key files
6. **Document**: Add notes/descriptions to runs
7. **Clean Up**: Delete failed or test runs regularly

---

## 🔧 Troubleshooting

### MLflow UI Not Starting

```bash
# Check if port is in use
lsof -i :5000

# Use different port
mlflow ui --port 5001
```

### Metrics Not Appearing

```python
# Ensure you're in an active run
with mlflow.start_run():
    mlflow.log_metric("test", 1.0)  # ✓ Correct
    
# This won't work:
mlflow.log_metric("test", 1.0)  # ✗ No active run
```

### Finding MLflow Data

```bash
# Default location
ls -la mlruns/

# Check tracking URI
python -c "import mlflow; print(mlflow.get_tracking_uri())"
```

---

## ✅ Summary

**All 21 metrics are logged to MLflow** during training:
- ✅ 6 Hyperparameters
- ✅ 6 Dataset statistics
- ✅ 3 Split metrics
- ✅ 7 Evaluation metrics (+ 4 additional)
- ✅ 2 Model artifacts

**Access**: `mlflow ui` → http://localhost:5000

**Location**: `./mlruns/` directory

🎉 **Complete MLflow integration for comprehensive experiment tracking!**
