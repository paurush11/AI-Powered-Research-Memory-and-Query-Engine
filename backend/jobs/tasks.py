from project_root.celery_app import app

@app.task(name="jobs.tasks.process_job")
def process_job(job_id: int):
    """Process a Job entity: placeholder stub."""
    # TODO: replace with real pipeline (ingest, embed, etc.)
    return {"status": "processed", "job_id": job_id} 