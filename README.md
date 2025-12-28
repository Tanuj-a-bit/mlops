# E-commerce Recommendation MLOps System

## 📋 Overview
A production-ready recommendation system built with modern MLOps practices, featuring collaborative filtering models, real-time serving, and comprehensive monitoring.

## ✨ Features

### 🎯 Recommendation Engine
- **Multiple Models:** BPR, ALS, LMF collaborative filtering
- **Personalized Recommendations:** User-based and item-based
- **Real-time Serving:** Low-latency API endpoints
- **Fallback Strategies:** Popular items when personalization unavailable

### 🛍️ E-commerce Platform
- **Modern UI:** Next.js with responsive design
- **Product Catalog:** Browsing, filtering, and search
- **User Authentication:** Secure login with NextAuth.js
- **Shopping Features:** Cart, wishlist, recommendations

### 📊 MLOps Infrastructure
- **Experiment Tracking:** MLflow for model versioning
- **Data Versioning:** DVC for dataset management
- **Monitoring:** Prometheus + Grafana dashboards
- **Drift Detection:** Evidently AI for data quality
- **CI/CD:** Automated testing and deployment (planned)

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Backend API │────▶│  Database   │
│  (Next.js)  │     │  (FastAPI)   │     │ (PostgreSQL)│
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  ML Service  │
                    │  (FastAPI)   │
                    └──────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │Prometheus│  │  MLflow  │
              └──────────┘  └──────────┘
                    │
                    ▼
              ┌──────────┐
              │ Grafana  │
              └──────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL 14+
- Docker (optional)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/recommendation-mlops.git
cd recommendation-mlops
```

2. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Update .env with your database URL
npx prisma migrate dev
npm run dev
```

3. **Setup Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8080
```

4. **Setup ML Service**
```bash
cd ml
pip install -e .
python main.py train --model bpr
python main.py serve --model bpr --port 8000
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- ML Service: http://localhost:8000
- API Docs: http://localhost:8080/docs

## 📚 Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design and components
- **[API Reference](docs/API.md)** - Complete API documentation
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup and development workflow
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Monitoring Guide](docs/MONITORING.md)** - Observability and metrics

### Model Cards
- [BPR Model](ml/model_cards/bpr_recommender.md)
- [ALS Model](ml/model_cards/als_recommender.md)
- [LMF Model](ml/model_cards/lmf_recommender.md)

### Data Cards
- [RetailRocket Dataset](ml/data_cards/retailrocket_datacard.md)

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Auth:** NextAuth.js
- **ORM:** Prisma

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.12
- **ORM:** SQLAlchemy
- **Validation:** Pydantic
- **Database:** PostgreSQL

### ML/Data
- **Models:** Implicit (BPR, ALS, LMF)
- **Processing:** Pandas, NumPy
- **Tracking:** MLflow
- **Versioning:** DVC
- **Drift:** Evidently AI

### DevOps
- **Monitoring:** Prometheus, Grafana
- **Containers:** Docker, Docker Compose
- **CI/CD:** GitHub Actions (planned)

## 📊 Monitoring

### Available Metrics
- Request rate and latency
- Error rates and types
- Recommendation quality (empty responses, item counts)
- Model performance (precision, recall, NDCG)
- Data drift detection

### Dashboards
Access Grafana at http://localhost:3001 (default: admin/admin)

### Drift Reports
```bash
cd ml
python main.py drift --model bpr
open monitoring/evidently_reports/drift_report.html
```

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
npm run test:e2e
```

### Backend
```bash
cd backend
pytest
pytest --cov=app
```

### ML
```bash
cd ml
pytest tests/
```

## 📈 Model Training

### Train Models
```bash
cd ml

# BPR (Bayesian Personalized Ranking)
python main.py train --model bpr --factors 100 --iterations 50

# ALS (Alternating Least Squares)
python main.py train --model als --factors 64 --iterations 15

# LMF (Logistic Matrix Factorization)
python main.py train --model lmf --factors 30 --iterations 30
```

### Evaluate Models
```bash
# Evaluate specific model
python main.py evaluate --model bpr

# Compare all models
python main.py compare
```

### Serve Models
```bash
# Serve BPR model
python main.py serve --model bpr --port 8000

# Serve ALS model
python main.py serve --model als --port 8000
```

## 🔄 Data Pipeline

### DVC Pipeline
```bash
cd ml

# Run full pipeline
dvc repro

# Run specific stage
dvc repro prepare

# View pipeline
dvc dag
```

### Manual Data Processing
```bash
# Load and process data
python src/data/loader.py

# Generate features
python src/data/feature_engineering.py
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Build images
docker build -t recommendation-frontend ./frontend
docker build -t recommendation-backend ./backend
docker build -t recommendation-ml ./ml

# Run containers
docker run -p 3000:3000 recommendation-frontend
docker run -p 8080:8080 recommendation-backend
docker run -p 8000:8000 recommendation-ml
```

## 🔐 Security

- **Authentication:** JWT-based with bcrypt password hashing
- **CORS:** Configured for allowed origins only
- **Environment Variables:** Sensitive data in .env files
- **Database:** SSL connections in production
- **API:** Rate limiting (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dataset:** RetailRocket E-commerce Dataset
- **Libraries:** Implicit, FastAPI, Next.js, Prisma
- **Inspiration:** Modern MLOps best practices

## 📞 Contact

- **Project Lead:** [Your Name]
- **Email:** your.email@example.com
- **GitHub:** [@yourusername](https://github.com/yourusername)
- **Issues:** [GitHub Issues](https://github.com/yourusername/recommendation-mlops/issues)

## 🗺️ Roadmap

### Current (v1.0)
- ✅ Basic recommendation engine
- ✅ E-commerce frontend
- ✅ API backend
- ✅ Monitoring setup
- ✅ Data drift detection

### Planned (v1.1)
- ⏳ A/B testing framework
- ⏳ Advanced filtering
- ⏳ Real-time event tracking
- ⏳ Automated retraining
- ⏳ Multi-model ensemble

### Future (v2.0)
- 🔮 Deep learning models
- 🔮 Graph-based recommendations
- 🔮 Multi-modal recommendations
- 🔮 Explainable AI
- 🔮 Mobile app

## 📊 Project Stats

- **Models:** 3 (BPR, ALS, LMF)
- **API Endpoints:** 15+
- **Metrics Tracked:** 10+
- **Test Coverage:** 75%+ (target)
- **Documentation Pages:** 5

---

Made with ❤️ by [Your Name]
