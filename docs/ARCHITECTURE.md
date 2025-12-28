# System Architecture Card

## Overview
This document describes the architecture of the E-commerce Recommendation MLOps system, including all components, their interactions, and deployment considerations.

## System Components

### 1. Frontend (Next.js)
- **Technology:** Next.js 14, React, TypeScript
- **Port:** 3000
- **Features:**
  - Server-side rendering for SEO
  - NextAuth.js for authentication
  - Personalized recommendation display
  - Product catalog with filtering
  - Shopping cart and wishlist
  - Responsive design with Tailwind CSS

### 2. Backend API (FastAPI)
- **Technology:** FastAPI, Python 3.12
- **Port:** 8080
- **Responsibilities:**
  - Product and category management
  - User authentication and authorization
  - Recommendation proxy and orchestration
  - Event tracking
  - Prometheus metrics exposure (`/metrics`)

### 3. ML Service (FastAPI)
- **Technology:** FastAPI, Python 3.12
- **Port:** 8000
- **Models Available:**
  - BPR (Bayesian Personalized Ranking)
  - ALS (Alternating Least Squares)
  - LMF (Logistic Matrix Factorization)
- **Metrics Port:** 8082 (Prometheus)

### 4. Database Layer
- **Primary Database:** PostgreSQL (Supabase)
- **Schema:** Products, Categories, Users, Events, Reviews
- **ORM:** Prisma (Frontend), SQLAlchemy (Backend)
- **Admin Tools:** Prisma Studio (ports 5555, 5556)

### 5. Monitoring Stack
- **Prometheus:** Metrics collection (port 9090)
- **Grafana:** Visualization dashboards (port 3001)
- **Evidently AI:** Data drift detection
- **MLflow:** Experiment tracking and model registry

## Data Flow

### Recommendation Request Flow
```
User Browser → Frontend (Next.js)
    ↓
Frontend API Route (/api/recommendations)
    ↓
Backend API (FastAPI :8080)
    ↓
Content-Based Filtering (TF-IDF + Cosine Similarity)
    ↓
Response with Recommendations
```

### Event Tracking Flow
```
User Interaction → Frontend
    ↓
Backend API Event Endpoint
    ↓
PostgreSQL (Events table)
    ↓
Periodic Batch Processing
    ↓
ML Model Retraining
```

## Security

### Authentication
- **Method:** NextAuth.js with Credentials provider
- **Password Hashing:** bcrypt
- **Session Management:** JWT tokens
- **Protected Routes:** Middleware-based route protection

### CORS Configuration
- **Allowed Origins:** 
  - http://localhost:3000
  - http://127.0.0.1:3000
- **Credentials:** Enabled
- **Methods:** All
- **Headers:** All

### Database Security
- **Connection:** SSL-enabled PostgreSQL
- **Credentials:** Environment variables only
- **Access Control:** Row-level security (planned)

## Deployment Architecture

### Development Environment
- **Frontend:** Local development server (npm run dev)
- **Backend:** Uvicorn with hot reload
- **ML Service:** Uvicorn with model loading
- **Database:** Remote Supabase instance
- **Monitoring:** Docker Compose (Prometheus + Grafana)

### Production Considerations
- **Frontend:** Vercel or similar edge deployment
- **Backend:** Containerized deployment (Docker)
- **ML Service:** Separate container with GPU support
- **Database:** Managed PostgreSQL with replication
- **Monitoring:** Kubernetes-based monitoring stack
- **CDN:** CloudFront or similar for static assets

## Scalability

### Horizontal Scaling
- **Frontend:** Edge deployment with CDN
- **Backend API:** Load-balanced instances
- **ML Service:** Multiple model instances with load balancer
- **Database:** Read replicas for queries

### Caching Strategy
- **Frontend:** Next.js ISR (Incremental Static Regeneration)
- **Backend:** Redis cache for recommendations (planned)
- **Database:** Query result caching

### Performance Targets
- **API Response Time:** < 200ms (p95)
- **Recommendation Latency:** < 500ms (p95)
- **Frontend Load Time:** < 2s (LCP)
- **Database Query Time:** < 50ms (p95)

## Monitoring & Observability

### Metrics Collected
- **System Metrics:**
  - Request count
  - Response latency
  - Error rate
  - Timeout count

- **Business Metrics:**
  - Recommendation type distribution
  - Empty response rate
  - Items returned per request
  - User engagement metrics

### Alerting (Planned)
- High error rate (> 5%)
- High latency (p95 > 1s)
- Empty recommendation rate (> 20%)
- Database connection failures

## Disaster Recovery

### Backup Strategy
- **Database:** Daily automated backups
- **Models:** Versioned in MLflow registry
- **Code:** Git repository with tags
- **Configuration:** Environment variables in secure vault

### Recovery Procedures
1. Database restore from latest backup
2. Model rollback to previous version
3. Code deployment from stable tag
4. Configuration restoration from vault

## Version Control

### Code
- **Repository:** Git
- **Branching:** Feature branches with PR reviews
- **CI/CD:** GitHub Actions (planned)

### Data
- **Tool:** DVC (Data Version Control)
- **Storage:** Remote storage for large datasets
- **Pipeline:** Defined in `dvc.yaml`

### Models
- **Registry:** MLflow
- **Versioning:** Automatic version tracking
- **Staging:** Development → Staging → Production

## Dependencies

### Frontend
- Next.js 14
- React 18
- NextAuth.js
- Prisma Client
- Framer Motion
- Zustand

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Prometheus Client
- Uvicorn

### ML
- Implicit (ALS, BPR, LMF)
- Scikit-learn
- Pandas
- NumPy
- MLflow
- Evidently AI

## Contact & Support
- **Project Lead:** [Your Name]
- **Repository:** [GitHub URL]
- **Documentation:** [Docs URL]
- **Issues:** [GitHub Issues URL]
