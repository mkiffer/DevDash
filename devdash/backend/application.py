"""
Application entry point for AWS Elastic Beanstalk.
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI application
from app.main import app

# Create a WSGI handler with proper error handling
def application(environ, start_response):
    # Handle CONTENT_LENGTH properly
    try:
        if 'CONTENT_LENGTH' not in environ or environ['CONTENT_LENGTH'] == '':
            environ['CONTENT_LENGTH'] = '0'
        content_length = int(environ['CONTENT_LENGTH'])
    except (ValueError, TypeError):
        environ['CONTENT_LENGTH'] = '0'
    
    # Log application startup for troubleshooting
    with open('/var/log/app_startup.log', 'a') as f:
        f.write(f"Starting application with environ keys: {list(environ.keys())}\n")
    
    # Continue with the regular request handling
    return app(environ, start_response)

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)