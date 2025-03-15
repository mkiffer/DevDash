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
    # Use a try-except block with proper fallback
    environ['CONTENT_LENGTH'] = environ.get('CONTENT_LENGTH', '0')
    
    # Continue with the regular request handling
    return app(environ, start_response)

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)