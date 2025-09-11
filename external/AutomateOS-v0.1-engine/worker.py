# RQ Worker Entrypoint 
# [[to runs the RQ worker process which listens to the Redis queue, picks up jobs on Background]]

import os
import redis
from redis import Redis
from rq import Worker, Queue

# The queues the worker will listen to.
listen = ['default']

# Redis connection details (default to Docker service hostname "redis").
redis_url = os.getenv('REDIS_URL', 'redis://redis:6379')
conn: Redis = redis.from_url(redis_url)

if __name__ == '__main__':
    # Create a list of Queue objects to listen to.
    queues = [Queue(name, connection=conn) for name in listen]
    
    # Create a new worker that listens on the specified queues.
    worker = Worker(queues, connection=conn)
    print("Starting Worker. Press Ctrl+C to stop")
    worker.work()