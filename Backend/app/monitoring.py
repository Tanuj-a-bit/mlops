
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter, Response

# System Metrics
REQUEST_COUNT = Counter('rec_request_count', 'Total recommendation requests')
LATENCY = Histogram('rec_latency_seconds', 'Time spent processing request', buckets=(.005, .01, .025, .05, .075, .1, .25, .5, .75, 1.0, 2.5, 5.0, 7.5, 10.0, float("inf")))
ERROR_COUNT = Counter('rec_error_count', 'Total recommendation errors')


# Quality Metrics
EMPTY_RESPONSE_COUNT = Counter('rec_empty_response_count', 'Total times no recommendations were found')
RECOMMENDATION_ITEM_COUNT = Histogram('rec_items_returned_count', 'Number of items returned in recommendation', buckets=(0, 1, 5, 10, 20, 50, 100))
RECOMMENDATION_TYPE_COUNT = Counter('rec_type_count', 'Type of recommendation served', ['type'])

def track_request():
    REQUEST_COUNT.inc()

def record_latency(duration):
    LATENCY.observe(duration)

def track_error():
    ERROR_COUNT.inc()

def track_empty_response():
    EMPTY_RESPONSE_COUNT.inc()

def record_item_count(count):
    RECOMMENDATION_ITEM_COUNT.observe(count)

def track_recommendation_type(rec_type):
    """rec_type: 'user_personalized', 'item_similar', 'popular_fallback'"""
    RECOMMENDATION_TYPE_COUNT.labels(type=rec_type).inc()

router = APIRouter()

@router.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
