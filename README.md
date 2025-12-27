# Recommendation MLOps Project

An end-to-end MLOps pipeline for a product recommendation system using the RetailRocket dataset.

## Dataset Acknowledgement
This project uses the **RetailRocket Recommender System Dataset** collected from a real-world e-commerce website.
- **Source:** [RetailRocket Dataset on Kaggle](https://www.kaggle.com/datasets/retailrocket/ecommerce-dataset)
- **Description:** The data contains ~2.75M user interaction events (view, addtocart, transaction), item properties, and category trees over a period of 4.5 months.

## Project Structure
- `data/`: Raw and processed data (tracked by DVC)
- `src/`: Source code for data processing, feature engineering, modeling, and serving
- `notebooks/`: Exploration and evaluation notebooks
- `monitoring/`: Configuration for Prometheus, Grafana, and Evidently AI
- `docs/`: Project documentation and reports
- `model_cards/` / `data_cards/`: Governance documentation

## MLOps Stack
- **Data Versioning:** DVC
- **Experiment Tracking:** Weights & Biases (WandB)
- **CI/CD:** GitHub Actions
- **Serving:** FastAPI + Docker
## Quick Start
1. **Using the CLI:**
   ```bash
   # Train the model
   uv run python main.py train
   
   # Evaluate performance
   uv run python main.py evaluate --random
   
   # Detect data drift
   uv run python main.py drift
   ```
2. **Launch Monitoring Stack:**
   ```bash
   docker-compose up -d
   ```
3. **Access Services:**
   - **FastAPI:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Prometheus:** [http://localhost:9090](http://localhost:9090)
   - **Grafana:** [http://localhost:3000](http://localhost:3000) (Admin dashboard pre-provisioned)
   - **Metrics:** [http://localhost:8081](http://localhost:8081)
