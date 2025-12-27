# Model Card: ALS Recommender (Collaborative Filtering)

## Model Details
- **Organization:** Student Project / Recommendation MLOps
- **Model Date:** December 2025
- **Model Type:** Alternating Least Squares (ALS) Matrix Factorization
- **Library:** `implicit` (v0.7.2)
- **Version:** v1.0.0

## Intended Use
- **Primary Use Case:** Personalized product recommendations for returning users on an e-commerce platform.
- **Out-of-Scope:** Cold-start users (users with no history), real-time session updates (requires retraining or streaming updates).

## Training Data
- **Dataset:** RetailRocket E-commerce Dataset.
- **Period:** May - Sept 2015.
- **Preprocessing:** Minimum 10 interactions per user, 80/20 temporal split.
- **Interaction Weights:** 
    - View: 1
    - Add-to-cart: 3
    - Transaction: 5

## Performance Metrics (Target vs Actual)
| Metric | Operational Target (v2.0) | Current Actual (v1.5) |
| :--- | :--- | :--- |
| **Precision@10** | 0.30 | 0.0173 |
| **Recall@10** | 0.40 | 0.0790 |
| **NDCG@10** | 0.35 | 0.0451 |

**Note:** Current actuals reflect performance on a random 80/20 interaction split. The gap to target indicates the need for hybrid models (Content-Based) and re-ranking layers to handle the high sparsity of the RetailRocket dataset.

## Ethical Considerations
- **Popularity Bias:** The model may favor highly popular items, potentially creating a feedback loop where niche items are never recommended.
- **Filter Bubbles:** Users might only see products similar to what they have already interacted with, limiting exploration.

## Limitations
- Performance depends on the density of the interaction matrix.
- Does not use item content (properties); purely interaction-based.
