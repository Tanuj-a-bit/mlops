import redis
from app.config import settings

class RedisClient:
    def __init__(self):
        self.redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )

    def get(self, key: str):
        return self.redis.get(key)
    
    def set(self, key: str, value: str, ex: int = None):
        return self.redis.set(key, value, ex=ex)
    
    def delete(self, key: str):
        return self.redis.delete(key)
        
redis_client = RedisClient()
