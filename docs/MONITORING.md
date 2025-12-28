# Monitoring and Observability Guide

## Overview
This guide covers the monitoring, logging, and observability setup for the E-commerce Recommendation MLOps system.

---

## Metrics Collection

### Prometheus Setup

#### Configuration
Location: `ml/monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'recommendation-api'
    static_configs:
      - targets: ['host.docker.internal:8082', 'host.docker.internal:8080']
```

#### Starting Prometheus
```bash
cd ml
docker-compose up -d prometheus

# Access UI
open http://localhost:9090
```

### Available Metrics

#### System Metrics

**Request Count**
```promql
rec_request_count
```
- Total number of recommendation requests
- Type: Counter
- Use: Track API usage and traffic patterns

**Latency**
```promql
rec_latency_seconds
```
- Time spent processing requests
- Type: Histogram
- Buckets: 5ms, 10ms, 25ms, 50ms, 75ms, 100ms, 250ms, 500ms, 750ms, 1s, 2.5s, 5s, 7.5s, 10s
- Use: Monitor performance and identify slow requests

**Error Count**
```promql
rec_error_count
```
- Total number of errors
- Type: Counter
- Use: Track system reliability

#### Quality Metrics

**Empty Response Count**
```promql
rec_empty_response_count
```
- Times when no recommendations were found
- Type: Counter
- Use: Monitor recommendation coverage

**Items Returned**
```promql
rec_items_returned_count
```
- Distribution of recommendation list sizes
- Type: Histogram
- Buckets: 0, 1, 5, 10, 20, 50, 100
- Use: Understand recommendation diversity

**Recommendation Type**
```promql
rec_type_count{type="user_personalized"}
rec_type_count{type="item_similar"}
```
- Breakdown by recommendation strategy
- Type: Counter with labels
- Use: Understand which strategies are used most

### Useful Queries

#### Request Rate (per second)
```promql
rate(rec_request_count[5m])
```

#### 95th Percentile Latency
```promql
histogram_quantile(0.95, rate(rec_latency_seconds_bucket[5m]))
```

#### Error Rate
```promql
rate(rec_error_count[5m]) / rate(rec_request_count[5m])
```

#### Average Items Returned
```promql
rate(rec_items_returned_count_sum[5m]) / rate(rec_items_returned_count_count[5m])
```

#### Empty Response Rate
```promql
rate(rec_empty_response_count[5m]) / rate(rec_request_count[5m])
```

---

## Grafana Dashboards

### Setup

#### Starting Grafana
```bash
cd ml
docker-compose up -d grafana

# Access UI (default: admin/admin)
open http://localhost:3001
```

#### Adding Prometheus Data Source
1. Navigate to Configuration → Data Sources
2. Click "Add data source"
3. Select "Prometheus"
4. URL: `http://prometheus:9090`
5. Click "Save & Test"

### Dashboard Panels

#### 1. Request Rate Panel
- **Type:** Graph
- **Query:** `rate(rec_request_count[5m])`
- **Title:** "Recommendation Requests per Second"
- **Y-axis:** requests/sec

#### 2. Latency Panel
- **Type:** Graph
- **Queries:**
  - P50: `histogram_quantile(0.50, rate(rec_latency_seconds_bucket[5m]))`
  - P95: `histogram_quantile(0.95, rate(rec_latency_seconds_bucket[5m]))`
  - P99: `histogram_quantile(0.99, rate(rec_latency_seconds_bucket[5m]))`
- **Title:** "Response Latency"
- **Y-axis:** seconds

#### 3. Error Rate Panel
- **Type:** Graph
- **Query:** `rate(rec_error_count[5m]) / rate(rec_request_count[5m]) * 100`
- **Title:** "Error Rate"
- **Y-axis:** percentage
- **Alert:** > 5%

#### 4. Recommendation Type Distribution
- **Type:** Pie Chart
- **Queries:**
  - User: `rec_type_count{type="user_personalized"}`
  - Item: `rec_type_count{type="item_similar"}`
- **Title:** "Recommendation Strategy Distribution"

#### 5. Empty Response Rate
- **Type:** Gauge
- **Query:** `rate(rec_empty_response_count[5m]) / rate(rec_request_count[5m]) * 100`
- **Title:** "Empty Response Rate"
- **Thresholds:** 
  - Green: < 10%
  - Yellow: 10-20%
  - Red: > 20%

#### 6. Items Returned Distribution
- **Type:** Heatmap
- **Query:** `rate(rec_items_returned_count_bucket[5m])`
- **Title:** "Recommendation List Size Distribution"

### Importing Dashboards
```bash
# Dashboard JSON files location
ls ml/monitoring/grafana/dashboards/

# Import via UI
# 1. Click "+" → Import
# 2. Upload JSON file or paste JSON
# 3. Select Prometheus data source
# 4. Click "Import"
```

---

## Data Drift Detection

### Evidently AI Setup

#### Running Drift Analysis
```bash
cd ml
python main.py drift --model bpr
```

#### Output
- **Report Location:** `ml/monitoring/evidently_reports/drift_report.html`
- **Metrics Tracked:**
  - Feature distribution changes
  - Data quality metrics
  - Model performance degradation

#### Opening Report
```bash
# macOS
open ml/monitoring/evidently_reports/drift_report.html

# Linux
xdg-open ml/monitoring/evidently_reports/drift_report.html
```

### Drift Metrics

#### Data Drift
- **User ID Distribution:** Changes in user activity patterns
- **Item ID Distribution:** Changes in product popularity
- **Event Type Distribution:** Changes in user behavior (view/cart/purchase)
- **Timestamp Distribution:** Temporal patterns

#### Data Quality
- **Missing Values:** Null rate changes
- **Duplicates:** Duplicate record detection
- **Outliers:** Anomalous values

### Automated Drift Detection
```bash
# Add to cron for daily checks
0 2 * * * cd /path/to/ml && python main.py drift --model bpr
```

---

## Alerting

### Prometheus Alerting Rules

#### Configuration
Create `ml/monitoring/alert_rules.yml`:

```yaml
groups:
  - name: recommendation_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(rec_error_count[5m]) / rate(rec_request_count[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}%"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(rec_latency_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s"

      - alert: HighEmptyResponseRate
        expr: rate(rec_empty_response_count[5m]) / rate(rec_request_count[5m]) > 0.2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High empty response rate"
          description: "{{ $value }}% of requests return no recommendations"

      - alert: ServiceDown
        expr: up{job="recommendation-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Recommendation service is down"
```

### Grafana Alerts

#### Setting Up Alerts
1. Edit dashboard panel
2. Click "Alert" tab
3. Configure conditions
4. Add notification channel

#### Example Alert: High Error Rate
- **Condition:** `WHEN avg() OF query(A, 5m, now) IS ABOVE 5`
- **Frequency:** Evaluate every 1m
- **For:** 5m
- **Notification:** Email, Slack, PagerDuty

---

## Logging

### Application Logs

#### Backend (FastAPI)
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("Recommendation request received", extra={"user_id": user_id})
```

#### ML Service
```python
import logging

logger = logging.getLogger(__name__)
logger.info(f"Model loaded: {model_path}")
logger.warning(f"Slow prediction: {latency}s")
logger.error(f"Prediction failed: {error}")
```

### Centralized Logging (Planned)

#### ELK Stack
- **Elasticsearch:** Log storage and search
- **Logstash:** Log aggregation and processing
- **Kibana:** Log visualization

#### Loki + Grafana
- **Loki:** Log aggregation
- **Promtail:** Log shipping
- **Grafana:** Unified metrics and logs

---

## Performance Monitoring

### Key Performance Indicators (KPIs)

#### System KPIs
- **Availability:** > 99.9%
- **Request Rate:** Track trends
- **Error Rate:** < 1%
- **P95 Latency:** < 500ms
- **P99 Latency:** < 1s

#### Business KPIs
- **Recommendation Coverage:** > 95%
- **Average Items Returned:** 5-10
- **User Personalization Rate:** > 80%
- **Click-Through Rate:** Track trends
- **Conversion Rate:** Track trends

### Monitoring Checklist

#### Daily
- [ ] Check error rate
- [ ] Review latency trends
- [ ] Verify all services are up
- [ ] Check empty response rate

#### Weekly
- [ ] Review performance trends
- [ ] Analyze slow queries
- [ ] Check resource utilization
- [ ] Review alert history

#### Monthly
- [ ] Run drift detection
- [ ] Review KPI trends
- [ ] Optimize slow endpoints
- [ ] Update dashboards

---

## Troubleshooting

### High Latency
1. Check Prometheus latency metrics
2. Identify slow endpoints
3. Review database query performance
4. Check model loading time
5. Verify network connectivity

### High Error Rate
1. Check error logs
2. Identify error patterns
3. Review recent deployments
4. Check database connectivity
5. Verify model availability

### Empty Recommendations
1. Check user history
2. Verify model is loaded
3. Review recommendation logic
4. Check data quality
5. Analyze drift reports

### Service Down
1. Check service logs
2. Verify container/process status
3. Check resource availability (CPU, memory)
4. Review recent changes
5. Restart service if needed

---

## Best Practices

### Metrics
- Use consistent naming conventions
- Add meaningful labels
- Set appropriate bucket sizes for histograms
- Document all custom metrics

### Dashboards
- Group related metrics
- Use consistent time ranges
- Add descriptions to panels
- Set up drill-down capabilities

### Alerts
- Avoid alert fatigue
- Set appropriate thresholds
- Include actionable information
- Test alerts regularly

### Logging
- Use structured logging
- Include context (user_id, request_id)
- Set appropriate log levels
- Rotate logs regularly

---

## Resources

### Documentation
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Evidently AI Documentation](https://docs.evidentlyai.com/)

### Dashboards
- Location: `ml/monitoring/grafana/dashboards/`
- Import via Grafana UI

### Metrics Endpoint
- Backend: `http://localhost:8080/metrics`
- ML Service: `http://localhost:8082/metrics`
