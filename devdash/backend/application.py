"""
Application entry point for AWS Elastic Beanstalk.
This file is required for Python Elastic Beanstalk applications.
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI application
from app.main import app

# Create a WSGI handler that safely handles all requests
def application(environ, start_response):
    # This is the line that was causing the error - safely handle missing CONTENT_LENGTH
    try:
        if 'CONTENT_LENGTH' in environ:
            request_body_size = int(environ['CONTENT_LENGTH'])
        else:
            request_body_size = 0
    except (ValueError, KeyError):
        request_body_size = 0
    
    # Continue with the regular request handling
    # This passes control to the ASGI->WSGI adapter that Uvicorn/Gunicorn creates
    return app(environ, start_response)

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)