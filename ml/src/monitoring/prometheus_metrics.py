from prometheus_client import start_http_server, Counter, Histogram, Summary, Gauge
import time

# System Metrics
REQUEST_COUNT = Counter('rec_request_count', 'Total recommendation requests')
LATENCY = Histogram('rec_latency_seconds', 'Time spent processing request', buckets=(.005, .01, .025, .05, .075, .1, .25, .5, .75, 1.0, 2.5, 5.0, 7.5, 10.0, float("inf")))
ERROR_COUNT = Counter('rec_error_count', 'Total recommendation errors')
TIMEOUT_COUNT = Counter('rec_timeout_count', 'Total recommendation timeouts')

# Business Metrics
CTR = Gauge('rec_ctr', 'Click-through rate of recommendations')
CONVERSION_RATE = Gauge('rec_conversion_rate', 'Conversion rate of recommendations')
DWELL_TIME = Summary('rec_dwell_time_seconds', 'Time spent by user on recommended item')
BOUNCE_RATE = Gauge('rec_bounce_rate', 'Bounce rate of recommendations')
ADD_TO_CART_RATE = Gauge('rec_add_to_cart_rate', 'Add-to-cart rate of recommendations')

# Helper counters for calculating rates if needed
CLICKS = Counter('rec_clicks_total', 'Total clicks on recommendations')
IMPRESSIONS = Counter('rec_impressions_total', 'Total impressions of recommendations')
CONVERSIONS = Counter('rec_conversions_total', 'Total conversions from recommendations')
ADD_TO_CARTS = Counter('rec_add_to_carts_total', 'Total add-to-carts from recommendations')
BOUNCES = Counter('rec_bounces_total', 'Total bounces from recommendations')

def start_metrics_server(port=8081):
    start_http_server(port)
    print(f"Metrics server started on port {port}")

def track_request():
    REQUEST_COUNT.inc()

def record_latency(duration):
    LATENCY.observe(duration)

def track_error():
    ERROR_COUNT.inc()

def track_timeout():
    TIMEOUT_COUNT.inc()

def record_feedback(event_type, value=None):
    """
    Records business feedback metrics.
    event_type: 'click', 'impression', 'conversion', 'add_to_cart', 'bounce', 'dwell_time'
    """
    if event_type == 'click':
        CLICKS.inc()
    elif event_type == 'impression':
        IMPRESSIONS.inc()
    elif event_type == 'conversion':
        CONVERSIONS.inc()
    elif event_type == 'add_to_cart':
        ADD_TO_CARTS.inc()
    elif event_type == 'bounce':
        BOUNCES.inc()
    elif event_type == 'dwell_time' and value is not None:
        DWELL_TIME.observe(value)
    
    # Update Gauges (simplified for demo, usually calculated in Prometheus/Grafana)
    # But we can update them here for immediate visibility if we want
