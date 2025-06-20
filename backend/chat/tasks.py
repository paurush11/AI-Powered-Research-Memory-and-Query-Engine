from project_root.celery_app import app

@app.task(name="chat.tasks.run_agent")
def run_agent(chat_session_id: int, user_message: str):
    """Invoke LangGraph agent to respond to user message (stub)."""
    # TODO integrate LangGraph agents once implemented in chat/agents
    return {"session": chat_session_id, "reply": f"Echo: {user_message}"} 