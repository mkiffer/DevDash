import sqlite3
import psycopg2
from app.core.config import settings
import json
import datetime

def serialize_datetime(obj):
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def export_sqlite_to_postgres():
    # Connect to SQLite database
    sqlite_conn = sqlite3.connect('chat.db')
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()
    
    # Connect to PostgreSQL
    postgres_conn = psycopg2.connect(settings.DATABASE_URL)
    postgres_cursor = postgres_conn.cursor()
    
    # Export chat sessions
    sqlite_cursor.execute("SELECT * FROM chat_sessions")
    sessions = [dict(row) for row in sqlite_cursor.fetchall()]
    
    for session in sessions:
        postgres_cursor.execute(
            "INSERT INTO chat_sessions (id, created_at, updated_at) VALUES (%s, %s, %s)",
            (session['id'], session['created_at'], session['updated_at'])
        )
    
    # Export chat messages
    sqlite_cursor.execute("SELECT * FROM chat_messages")
    messages = [dict(row) for row in sqlite_cursor.fetchall()]
    
    for message in messages:
        postgres_cursor.execute(
            "INSERT INTO chat_messages (id, session_id, role, content, timestamp) VALUES (%s, %s, %s, %s, %s)",
            (message['id'], message['session_id'], message['role'], message['content'], message['timestamp'])
        )
    
    # Commit changes
    postgres_conn.commit()
    
    # Close connections
    sqlite_conn.close()
    postgres_conn.close()
    

if __name__ == "__main__":
    export_sqlite_to_postgres()