from project_root.celery_app import app

@app.task(name="upload.tasks.parse_document")
def parse_document(document_id: int):
    """Parse and index an uploaded document (stub)."""
    # TODO implement parsing & embedding
    return {"status": "parsed", "document_id": document_id} 