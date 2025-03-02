"""
Application entry point for AWS Elastic Beanstalk.
This file is required for Python Elastic Beanstalk applications.
"""
from main import app

# This is required for WSGI applications
application = app  # noqa

if __name__ == "__main__":
    # For local development
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)