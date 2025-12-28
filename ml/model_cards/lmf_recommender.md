# Model Card: LMF Recommender (Logistic Matrix Factorization)

## Model Details
- **Organization:** Student Project / Recommendation MLOps
- **Model Date:** December 2025
- **Model Type:** Logistic Matrix Factorization (LMF)
- **Library:** `implicit` (v0.7.2)
- **Version:** v1.0.1 (Baseline Evaluated)

## Intended Use
- **Primary Use Case:** Modeling the probability of a user interacting with an item. Often performs well when the distribution of interactions matches a logistic curve.
- **Out-of-Scope:** Cold-start users.

## Training Data
- **Dataset:** RetailRocket E-commerce Dataset.
- **Period:** May - Sept 2015.
- **Preprocessing:** Minimum 10 interactions per user, 14-day temporal split.

## Performance Metrics
| Metric | Current Actual (v1.0.1) |
| :--- | :--- |
| **Precision@10** | 0.0001 |
| **Recall@10** | 0.0001 |
| **NDCG@10** | 0.0001 |
| **Hit Rate@10** | 0.0008 |

## Ethical Considerations
- **Probabilistic Calibration:** The model outputs probabilities which may still be biased towards popular items depending on the regularization.

## Limitations
- Sensitive to the choice of `learning_rate` and `regularization`.
