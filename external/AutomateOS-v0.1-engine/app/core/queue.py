import os
import redis
from rq import Queue

# Configure Redis connection.
# Prefer REDIS_URL environment variable; fall back to localhost for dev or docker service name
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_conn = redis.from_url(REDIS_URL)

# Variable for handle queue.
q = Queue(connection=redis_conn)