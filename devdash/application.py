"""
Application entry point for AWS Elastic Beanstalk.
This file is required for Python Elastic Beanstalk applications.
"""
import os
import sys

sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from app.main import app as application


if __name__ == "__main__":
    # For local development
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)