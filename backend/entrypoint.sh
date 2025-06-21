#!/bin/sh

# Apply database migrations
# python manage.py makemigrations --noinput --settings=project_root.settings
python manage.py migrate --noinput --settings=project_root.settings

# Collect static files if desired (optional, uncomment)
# python manage.py collectstatic --noinput

# Execute the CMD passed from Dockerfile or docker-compose
exec "$@" 