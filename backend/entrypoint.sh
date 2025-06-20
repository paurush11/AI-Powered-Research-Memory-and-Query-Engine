#!/bin/sh

# Apply database migrations
python manage.py migrate --noinput

# Collect static files if desired (optional, uncomment)
# python manage.py collectstatic --noinput

# Execute the CMD passed from Dockerfile or docker-compose
exec "$@" 