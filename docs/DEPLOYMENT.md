# Deployment Guide

## Overview
This guide covers deploying the E-commerce Recommendation MLOps system to production environments.

---

## Prerequisites

### System Requirements
- **OS:** Linux (Ubuntu 20.04+ recommended) or macOS
- **RAM:** Minimum 8GB, Recommended 16GB+
- **CPU:** 4+ cores recommended
- **Storage:** 50GB+ available space
- **Network:** Stable internet connection

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Python 3.12+
- PostgreSQL 14+ (or managed service)
- Git

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/recommendation-mlops.git
cd recommendation-mlops
```

### 2. Environment Variables

#### Frontend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# ML Backend
ML_BACKEND_URL="http://localhost:8000"

# Authentication
AUTH_SECRET="your-super-secret-key-change-in-production"
AUTH_URL="https://yourdomain.com"
```

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Security
SECRET_KEY="your-super-secret-key-change-in-production"

# CORS
BACKEND_CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

#### ML Service (.env)
```bash
# MLflow
MLFLOW_TRACKING_URI="http://localhost:5000"

# Model Path
MODEL_PATH="models/bpr_model.pkl"
```

---

## Deployment Options

### Option 1: Docker Compose (Recommended for Small-Medium Scale)

#### 1. Build Images
```bash
# Build all services
docker-compose build

# Or build individually
docker-compose build frontend
docker-compose build backend
docker-compose build ml-service
```

#### 2. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

#### 3. Initialize Database
```bash
# Run migrations (frontend)
docker-compose exec frontend npx prisma migrate deploy

# Seed data (optional)
docker-compose exec frontend npx prisma db seed
```

#### 4. Verify Deployment
```bash
# Check health endpoints
curl http://localhost:8080/health
curl http://localhost:8000/health

# Access frontend
open http://localhost:3000
```

### Option 2: Kubernetes (Recommended for Large Scale)

#### 1. Create Namespace
```bash
kubectl create namespace recommendation-system
```

#### 2. Deploy Database (if not using managed service)
```bash
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
```

#### 3. Create Secrets
```bash
kubectl create secret generic app-secrets \
  --from-literal=database-url='postgresql://...' \
  --from-literal=auth-secret='...' \
  -n recommendation-system
```

#### 4. Deploy Services
```bash
# Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# ML Service
kubectl apply -f k8s/ml-deployment.yaml
kubectl apply -f k8s/ml-service.yaml

# Monitoring
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/grafana-deployment.yaml
```

#### 5. Configure Ingress
```bash
kubectl apply -f k8s/ingress.yaml
```

### Option 3: Cloud Platform Specific

#### Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### AWS ECS
1. Create ECR repositories
2. Build and push Docker images
3. Create ECS task definitions
4. Deploy services to ECS cluster
5. Configure Application Load Balancer

#### Google Cloud Run
```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT_ID/frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/backend
gcloud builds submit --tag gcr.io/PROJECT_ID/ml-service

# Deploy services
gcloud run deploy frontend --image gcr.io/PROJECT_ID/frontend
gcloud run deploy backend --image gcr.io/PROJECT_ID/backend
gcloud run deploy ml-service --image gcr.io/PROJECT_ID/ml-service
```

---

## Database Setup

### PostgreSQL (Managed Service Recommended)

#### Supabase
1. Create project at supabase.com
2. Copy connection string
3. Update DATABASE_URL in .env files
4. Run migrations

#### AWS RDS
1. Create PostgreSQL instance
2. Configure security groups
3. Enable SSL connections
4. Update DATABASE_URL

#### Self-Hosted
```bash
# Install PostgreSQL
sudo apt-get install postgresql-14

# Create database
sudo -u postgres createdb recommendation_db

# Create user
sudo -u postgres createuser -P recommendation_user

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE recommendation_db TO recommendation_user;"
```

---

## SSL/TLS Configuration

### Using Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx
sudo nano /etc/nginx/sites-available/recommendation-system
```

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Monitoring Setup

### Prometheus
```bash
# Start Prometheus
docker run -d \
  -p 9090:9090 \
  -v ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### Grafana
```bash
# Start Grafana
docker run -d \
  -p 3001:3000 \
  -v ./monitoring/grafana:/etc/grafana/provisioning \
  grafana/grafana
```

### Configure Alerts
1. Access Grafana at http://localhost:3001
2. Add Prometheus data source
3. Import dashboards from `monitoring/grafana/dashboards/`
4. Configure alert rules

---

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker images
        run: docker-compose build
      
      - name: Run tests
        run: |
          cd frontend && npm test
          cd ../backend && pytest
      
      - name: Push to registry
        run: |
          docker push your-registry/frontend:latest
          docker push your-registry/backend:latest
      
      - name: Deploy to production
        run: |
          ssh user@production-server 'docker-compose pull && docker-compose up -d'
```

---

## Scaling Strategies

### Horizontal Scaling
```bash
# Scale backend replicas
docker-compose up -d --scale backend=3

# Kubernetes scaling
kubectl scale deployment backend --replicas=5 -n recommendation-system
```

### Load Balancing
- Use Nginx or HAProxy for load balancing
- Configure health checks
- Enable session affinity if needed

### Database Scaling
- Enable read replicas
- Implement connection pooling (PgBouncer)
- Use caching layer (Redis)

---

## Backup and Recovery

### Database Backups
```bash
# Automated daily backups
0 2 * * * pg_dump -U user dbname | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz

# Restore from backup
gunzip < backup.sql.gz | psql -U user dbname
```

### Model Backups
```bash
# Backup models directory
tar -czf models-backup-$(date +%Y%m%d).tar.gz models/

# Upload to S3
aws s3 cp models-backup-*.tar.gz s3://your-bucket/backups/
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/TLS for all services
- [ ] Configure firewall rules
- [ ] Enable database encryption at rest
- [ ] Implement rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Implement secrets management (Vault, AWS Secrets Manager)
- [ ] Configure CORS properly
- [ ] Enable CSRF protection
- [ ] Implement input validation

---

## Performance Optimization

### Frontend
- Enable Next.js production build
- Configure CDN for static assets
- Enable image optimization
- Implement code splitting
- Use service workers for caching

### Backend
- Enable response compression
- Implement caching headers
- Use connection pooling
- Optimize database queries
- Enable query result caching

### ML Service
- Pre-load models at startup
- Implement model caching
- Use batch prediction when possible
- Consider GPU acceleration for large models

---

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check database connectivity
psql -h host -U user -d dbname

# Verify connection string
echo $DATABASE_URL
```

#### Service Not Starting
```bash
# Check logs
docker-compose logs service-name

# Verify environment variables
docker-compose config
```

#### High Memory Usage
```bash
# Monitor resource usage
docker stats

# Adjust memory limits in docker-compose.yml
```

---

## Rollback Procedures

### Quick Rollback
```bash
# Docker Compose
docker-compose down
docker-compose up -d --force-recreate

# Kubernetes
kubectl rollout undo deployment/backend -n recommendation-system
```

### Database Rollback
```bash
# Restore from backup
psql -U user dbname < backup.sql

# Or use Prisma migrations
npx prisma migrate reset
```

---

## Maintenance

### Regular Tasks
- **Daily:** Monitor logs and metrics
- **Weekly:** Review error rates and performance
- **Monthly:** Update dependencies and security patches
- **Quarterly:** Review and optimize database indexes
- **Annually:** Disaster recovery drill

### Update Procedure
1. Test updates in staging environment
2. Create backup of production database
3. Schedule maintenance window
4. Deploy updates
5. Verify functionality
6. Monitor for issues

---

## Support and Resources

- **Documentation:** `/docs`
- **Issues:** GitHub Issues
- **Monitoring:** Grafana Dashboard
- **Logs:** Centralized logging system
- **Status Page:** status.yourdomain.com (if configured)
