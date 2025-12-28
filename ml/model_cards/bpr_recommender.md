# Model Card: BPR Recommender (Bayesian Personalized Ranking)

## Model Details
- **Organization:** Student Project / Recommendation MLOps
- **Model Date:** December 2025
- **Model Type:** Bayesian Personalized Ranking (BPR)
- **Library:** `implicit` (v0.7.2)
- **Version:** v1.1.0 (Winning Model)

## Intended Use
- **Primary Use Case:** Learning-to-rank items based on user-item pairs. Optimized for positive feedback (clicks/purchases).
- **Out-of-Scope:** Cold-start users.

## Training Data
- **Dataset:** RetailRocket E-commerce Dataset.
- **Period:** May - Sept 2015.
- **Preprocessing:** Minimum 10 interactions per user, 14-day temporal split.
- **BPR Input:** Treats interactions as binary positive signals.

## Performance Metrics
| Metric | Current Actual (v1.1.0) |
| :--- | :--- |
| **Precision@10** | 0.0479 |
| **Recall@10** | 0.2400 |
| **NDCG@10** | 0.1910 |
| **Hit Rate@10** | 0.3471 |

**Note:** BPR has surpassed ALS after extensive iterative training with `factors=1050` and high iteration counts (totaling ~1000+ iterations across resumed sessions). It is now the primary model for recommendation discovery.

## Ethical Considerations
- **Binary Assumption:** Assumes all interactions (views vs purchases) carry the same intent, which might be a limitation compared to weighted ALS.

## Limitations
- Training time is longer than ALS as it uses Stochastic Gradient Descent.
- Does not explicitly utilize the magnitude of interaction weights.
