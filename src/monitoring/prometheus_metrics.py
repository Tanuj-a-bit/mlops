from prometheus_client import start_http_server, Counter, Histogram
import time

# Metrics definitions
REQUEST_COUNT = Counter('rec_request_count', 'Total recommendation requests')
LATENCY = Histogram('rec_latency_seconds', 'Time spent processing request')

def start_metrics_server(port=8000):
    start_http_server(port)
    print(f"Metrics server started on port {port}")

def track_request():
    REQUEST_COUNT.inc()

def record_latency(duration):
    LATENCY.observe(duration)
