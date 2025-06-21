# AI-Powered Research Memory & Query Engine

This repository contains a Django + React (Vite + TS) application providing a chat-style interface, background job processing, and file upload/storage capabilities.

## Quick start (development)

```bash
# clone and enter repo
cp .env.example .env   # then edit values
docker-compose up --build
```

The stack includes:

* Django & DRF back-end (`backend/`)
* React front-end (`frontend/`)
* Postgres + Redis via Docker-Compose
* Celery worker & beat scheduler

## Environment variables

# Inside Docker-Compose, use service name "postgres" instead of localhost
DATABASE_URL=postgres://postgres:postgres@postgres:5432/research_memory
