# gunicorn.conf.py
bind = "0.0.0.0:10000"
workers = 1
timeout = 120  # Increase to 2 minutes
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
preload_app = True
keepalive = 5
