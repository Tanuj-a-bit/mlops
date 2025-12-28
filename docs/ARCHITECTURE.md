# 🏗️ Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RECOMMENDATION SYSTEM                            │
│                         MONITORING ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          1. TRAINING PHASE                               │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   Raw Data   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐      ┌─────────────────────────────────┐
    │ Preprocessor │─────▶│  Interaction Weights Created    │
    └──────┬───────┘      │  (view, addtocart, transaction) │
           │              └─────────────────────────────────┘
           ▼
    ┌──────────────┐
    │ ALS Trainer  │
    └──────┬───────┘
           │
           ├─────────────────────────────────────────────────────┐
           │                                                     │
           ▼                                                     ▼
    ┌──────────────┐                                    ┌──────────────┐
    │   MLflow     │◀─── Logs Params & Metrics         │    WandB     │
    │              │     • precision@10: 0.2838         │              │
    │  Experiment  │     • recall@10: 0.3609            │ Visualization│
    │   Tracking   │     • f1@10: 0.2737                │              │
    │              │     • ndcg@10: 0.4637              │              │
    │              │     • map: 0.3288                  │              │
    │              │     • mrr: 0.7681                  │              │
    │              │     • hit_rate: 0.9452             │              │
    └──────────────┘                                    └──────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                        2. SERVING PHASE                                  │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │     User     │
    └──────┬───────┘
           │
           │ POST /recommend
           ▼
    ┌─────────────────────────────────────────────────┐
    │            FastAPI Application                  │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  /recommend Endpoint                │       │
    │  │  • Load ALS model                   │       │
    │  │  • Generate recommendations         │       │
    │  │  • Track metrics:                   │       │
    │  │    - track_request()                │       │
    │  │    - record_latency(duration)       │       │
    │  │    - track_error() [if error]       │       │
    │  │    - track_timeout() [if >500ms]    │       │
    │  └─────────────────────────────────────┘       │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  /feedback Endpoint                 │       │
    │  │  • record_feedback("click")         │       │
    │  │  • record_feedback("conversion")    │       │
    │  │  • record_feedback("add_to_cart")   │       │
    │  │  • record_feedback("bounce")        │       │
    │  │  • record_feedback("dwell_time", 45)│       │
    │  └─────────────────────────────────────┘       │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  Prometheus Metrics Server          │       │
    │  │  Port: 8081                         │       │
    │  │  Endpoint: /metrics                 │       │
    │  └─────────────────────────────────────┘       │
    └─────────────────┬───────────────────────────────┘
                      │
                      │ Exposes metrics
                      ▼
    ┌─────────────────────────────────────────────────┐
    │         Prometheus Metrics (Port 8081)          │
    │                                                 │
    │  SYSTEM METRICS:                                │
    │  • rec_request_count_total                      │
    │  • rec_latency_seconds (histogram)              │
    │  • rec_error_count_total                        │
    │  • rec_timeout_count_total                      │
    │                                                 │
    │  BUSINESS METRICS:                              │
    │  • rec_ctr (gauge)                              │
    │  • rec_conversion_rate (gauge)                  │
    │  • rec_dwell_time_seconds (summary)             │
    │  • rec_bounce_rate (gauge)                      │
    │  • rec_add_to_cart_rate (gauge)                 │
    │  • rec_clicks_total                             │
    │  • rec_impressions_total                        │
    │  • rec_conversions_total                        │
    │  • rec_add_to_carts_total                       │
    │  • rec_bounces_total                            │
    └─────────────────┬───────────────────────────────┘
                      │
                      │ Scrapes every 10s
                      ▼
    ┌─────────────────────────────────────────────────┐
    │          Prometheus Server (Port 9090)          │
    │                                                 │
    │  • Stores time-series data                      │
    │  • Retention: 15 days (configurable)            │
    │  • Query language: PromQL                       │
    │                                                 │
    │  Example Queries:                               │
    │  • rate(rec_request_count_total[5m])            │
    │  • histogram_quantile(0.95,                     │
    │      rate(rec_latency_seconds_bucket[5m]))      │
    └─────────────────┬───────────────────────────────┘
                      │
                      │ Data source
                      ▼
    ┌─────────────────────────────────────────────────┐
    │           Grafana (Port 3000)                   │
    │                                                 │
    │  Dashboard: recommendation_system.json          │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  System Performance Panels          │       │
    │  │  • Request Rate (RPS)               │       │
    │  │  • Latency (p95/p99)                │       │
    │  │  • Error & Timeout Rate             │       │
    │  └─────────────────────────────────────┘       │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  Business Metrics Panels            │       │
    │  │  • CTR, Conversion, Add-to-Cart     │       │
    │  │  • Bounce Rate                      │       │
    │  │  • Dwell Time Distribution          │       │
    │  │  • User Actions Over Time           │       │
    │  └─────────────────────────────────────┘       │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  Model Quality Panels               │       │
    │  │  • Precision@10, Recall@10, F1@10   │       │
    │  │  • NDCG@10, MAP, MRR                │       │
    │  └─────────────────────────────────────┘       │
    └─────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                    3. DATA QUALITY MONITORING                            │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────┐
    │  Scheduled Job (Daily/Weekly)│
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────┐
    │         Drift Detector (Evidently AI)           │
    │                                                 │
    │  Input:                                         │
    │  • Reference Data (training set, 80%)           │
    │  • Current Data (recent production, 20%)        │
    │                                                 │
    │  Metrics:                                       │
    │  ┌─────────────────────────────────────┐       │
    │  │  DataDriftPreset                    │       │
    │  │  • KS statistic per feature         │       │
    │  │  • PSI (Population Stability Index) │       │
    │  │  • Drift detection threshold        │       │
    │  └─────────────────────────────────────┘       │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  DataSummaryPreset                  │       │
    │  │  • Mean/Std shift                   │       │
    │  │  • Min/Max changes                  │       │
    │  │  • Distribution plots               │       │
    │  └─────────────────────────────────────┘       │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  DatasetMissingValueCount           │       │
    │  │  • Null/missing rate per column     │       │
    │  │  • Comparison: ref vs current       │       │
    │  └─────────────────────────────────────┘       │
    │                                                 │
    │  ┌─────────────────────────────────────┐       │
    │  │  ValueDrift (per column)            │       │
    │  │  • visitorid drift                  │       │
    │  │  • itemid drift                     │       │
    │  │  • weight drift                     │       │
    │  └─────────────────────────────────────┘       │
    └─────────────────┬───────────────────────────────┘
                      │
                      │ Generates
                      ▼
    ┌─────────────────────────────────────────────────┐
    │      Evidently HTML Report                      │
    │                                                 │
    │  File: monitoring/evidently_reports/            │
    │        drift_report.html                        │
    │                                                 │
    │  Contents:                                      │
    │  • Data Drift Summary                           │
    │  • Drifted Columns Count                        │
    │  • Feature-level Analysis                       │
    │  • Distribution Plots                           │
    │  • Statistical Test Results                     │
    │  • Missing Value Analysis                       │
    └─────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      4. COMPLETE METRICS FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

    OFFLINE METRICS (Training Time)
    ├─ Precision@10 ──────────┐
    ├─ Recall@10 ─────────────┤
    ├─ F1@10 ─────────────────┤
    ├─ NDCG@10 ───────────────┼──▶ MLflow + WandB
    ├─ MAP ───────────────────┤
    ├─ MRR ───────────────────┤
    └─ Hit Rate@10 ───────────┘

    ONLINE METRICS (Serving Time)
    ├─ System Performance ────┐
    │  ├─ Latency (p95/p99) ──┤
    │  ├─ RPS ────────────────┤
    │  ├─ Error Rate ─────────┼──▶ Prometheus ──▶ Grafana
    │  └─ Timeout Rate ───────┤
    │                          │
    ├─ Business Metrics ───────┤
    │  ├─ CTR ────────────────┤
    │  ├─ Conversion Rate ────┤
    │  ├─ Dwell Time ─────────┤
    │  ├─ Bounce Rate ────────┤
    │  └─ Add-to-Cart Rate ───┘
    │
    └─ Data Quality ──────────┐
       ├─ Feature Drift ──────┤
       ├─ PSI ───────────────┤
       ├─ KS Statistic ───────┼──▶ Evidently AI ──▶ HTML Reports
       ├─ Null Rate ─────────┤
       └─ Out-of-Range ───────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY STACK                                 │
└─────────────────────────────────────────────────────────────────────────┘

    ┌────────────────┬──────────────────────────────────────┐
    │ Component      │ Technology                           │
    ├────────────────┼──────────────────────────────────────┤
    │ API Server     │ FastAPI (Python)                     │
    │ Model          │ Implicit ALS (Collaborative Filter)  │
    │ Metrics Export │ prometheus-client                    │
    │ Metrics Store  │ Prometheus                           │
    │ Visualization  │ Grafana                              │
    │ Drift Detection│ Evidently AI 0.7.18                  │
    │ Experiment Log │ MLflow + WandB                       │
    │ Data Pipeline  │ DVC                                  │
    │ Orchestration  │ Docker Compose                       │
    └────────────────┴──────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                            PORTS                                         │
└─────────────────────────────────────────────────────────────────────────┘

    8000  ─── FastAPI Application (Recommendation API)
    8081  ─── Prometheus Metrics Endpoint
    9090  ─── Prometheus Server
    3000  ─── Grafana Dashboard
    5000  ─── MLflow UI


┌─────────────────────────────────────────────────────────────────────────┐
│                      MONITORING WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

    1. User Request ──▶ FastAPI ──▶ Model Inference
                          │
                          ├──▶ track_request()
                          ├──▶ record_latency()
                          └──▶ track_error() [if needed]

    2. User Feedback ──▶ /feedback ──▶ record_feedback()
                                          │
                                          ├──▶ CLICKS.inc()
                                          ├──▶ CONVERSIONS.inc()
                                          └──▶ DWELL_TIME.observe()

    3. Prometheus ──▶ Scrape :8081/metrics every 10s

    4. Grafana ──▶ Query Prometheus ──▶ Display Dashboards

    5. Scheduled Job ──▶ Drift Detector ──▶ Evidently Report

    6. Training ──▶ Evaluate ──▶ Log to MLflow + WandB


✅ COMPLETE MONITORING SYSTEM - ALL 21 METRICS TRACKED!
