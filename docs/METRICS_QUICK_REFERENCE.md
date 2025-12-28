# 🎯 Quick Reference: Monitoring Metrics

## 📊 All Implemented Metrics (21 Total)

### 1️⃣ Offline Evaluation Metrics (7)
```python
# Run: uv run python src/evaluation/metrics.py

Precision@10:  0.2838  # Fraction of relevant items in top-10
Recall@10:     0.3609  # Fraction of relevant items retrieved
F1@10:         0.2737  # Harmonic mean of P&R
NDCG@10:       0.4637  # Position-aware ranking quality
MAP:           0.3288  # Mean Average Precision
MRR:           0.7681  # Mean Reciprocal Rank
Hit Rate@10:   0.9452  # % users with ≥1 relevant item
```

### 2️⃣ Business Metrics (5)
```python
# Tracked via: POST /feedback endpoint

CTR                # Click-Through Rate
Conversion Rate    # Purchases / Recommendations
Dwell Time         # Time spent on item (seconds)
Bounce Rate        # % immediate exits
Add-to-Cart Rate   # % added to cart
```

### 3️⃣ System Performance (4)
```python
# Tracked via: Prometheus on port 8081

Latency p95/p99    # 95th/99th percentile response time
RPS                # Requests per second
Error Rate         # Failed requests / total
Timeout Rate       # Requests > 500ms
```

### 4️⃣ Data Quality & Drift (5)
```python
# Run: uv run python src/monitoring/drift_detector.py

Feature Mean/Std Shift  # Statistical distribution changes
PSI                     # Population Stability Index
KS Statistic            # Kolmogorov-Smirnov test
Null/Missing Rate       # % missing values
Out-of-Range Values     # Values outside bounds
```

---

## 🚀 Quick Commands

### Start Monitoring Stack
```bash
# Start Prometheus + Grafana
docker-compose up -d prometheus grafana

# Start API with metrics
uv run uvicorn src.serving.app:app --port 8000

# View metrics
curl http://localhost:8081/metrics
```

### Run Evaluations
```bash
# Offline metrics
uv run python src/evaluation/metrics.py

# Drift detection
uv run python src/monitoring/drift_detector.py

# MLflow UI
mlflow ui
```

### Test API
```bash
# Get recommendations
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_id": 12345, "n": 10}'

# Send feedback
curl -X POST http://localhost:8000/feedback \
  -H "Content-Type: application/json" \
  -d '{"event_type": "click", "user_id": 12345, "item_id": 67890}'
```

---

## 📈 Prometheus Queries

```promql
# Request rate
rate(rec_request_count_total[5m])

# p95 latency
histogram_quantile(0.95, rate(rec_latency_seconds_bucket[5m]))

# Error rate
rate(rec_error_count_total[5m]) / rate(rec_request_count_total[5m])

# CTR
rec_ctr

# Click rate
rate(rec_clicks_total[5m])
```

---

## 🎨 Grafana Dashboard

**Location**: `monitoring/grafana/dashboards/recommendation_system.json`

**Panels**:
- System: RPS, Latency, Errors
- Business: CTR, Conversion, Dwell Time, Bounce Rate
- Model: Precision, Recall, F1, NDCG, MAP, MRR

**Access**: http://localhost:3000 (admin/admin)

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/evaluation/metrics.py` | Offline metrics (P, R, F1, NDCG, MAP, MRR, HR) |
| `src/monitoring/prometheus_metrics.py` | Prometheus metrics definitions |
| `src/monitoring/drift_detector.py` | Evidently drift detection |
| `src/serving/app.py` | FastAPI with metrics endpoints |
| `src/training/trainer.py` | MLflow + WandB integration |
| `monitoring/grafana/dashboards/` | Grafana dashboard JSON |
| `monitoring/prometheus/prometheus.yml` | Prometheus config |
| `docs/MONITORING.md` | Full documentation |

---

## ✅ Status: COMPLETE

**21/21 metrics implemented** across all categories! 🎉
