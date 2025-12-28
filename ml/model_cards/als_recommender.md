# Model Card: ALS Recommender (Collaborative Filtering)

## Model Details
- **Organization:** Student Project / Recommendation MLOps
- **Model Date:** December 2025
- **Model Type:** Alternating Least Squares (ALS) Matrix Factorization
- **Library:** `implicit` (v0.7.2)
- **Version:** v1.8.0 (High Factor 500)

## Intended Use
- **Primary Use Case:** Personalized product recommendations for returning users on an e-commerce platform.
- **Out-of-Scope:** Cold-start users (users with no history), real-time session updates (requires retraining or streaming updates).

## Training Data
- **Dataset:** RetailRocket E-commerce Dataset.
- **Period:** May - Sept 2015.
- **Preprocessing:** Minimum 10 interactions per user, 14-day temporal split (realistic validation).
- **Interaction Weights:** 
    - View: 1
    - Add-to-cart: 50
    - Transaction: 250

## Performance Metrics (Target vs Actual)
| Metric | Operational Target | Current Actual (v1.8) |
| :--- | :--- | :--- |
| **Precision@10** | 0.20 | 0.0462 |
| **Recall@10** | 0.30 | 0.2261 |
| **NDCG@10** | 0.25 | 0.1961 |
| **Hit Rate@10** | 0.35 | 0.3340 |

**Note:** Current actuals reflect performance on a rigorous 14-day temporal split. Re-recommendation of previously viewed items is enabled to align with e-commerce re-engagement patterns.

## Ethical Considerations
- **Popularity Bias:** The model may favor highly popular items, potentially creating a feedback loop where niche items are never recommended.
- **Filter Bubbles:** Users might only see products similar to what they have already interacted with, limiting exploration.

## Limitations
- Performance depends on the density of the interaction matrix.
- Does not use item content (properties); purely interaction-based.
## Monitoring
- **Infrastructure:** Prometheus (Port 8081) & Grafana Dashboard.
- **Metrics Tracked:** Request counts, latency histograms, error rates, and business metrics (CTR, Conversions via feedback loop).
- **Drift Detection:** Data drift analysis integrated via `ml/main.py drift` using Evidently AI.
- **Experiment Tracking:** MLflow (experiment: `als-recommendation`) and WandB (project: `recommendation-mlops-als`).
