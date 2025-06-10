#!/bin/sh
# Exit on any error
set -e

echo "########## DEBUG ENTRYPOINT SCRIPT STARTED ##########"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo "Listing /app directory:"
ls -la /app
echo "Listing /app/app directory:"
ls -la /app/app

echo "########## ENVIRONMENT VARIABLES ##########"
printenv | sort
echo "Specifically checking critical env vars:"
echo "PORT (from App Runner): ->${PORT}<-"
echo "DATABASE_URL (from App Runner): ->${DATABASE_URL}<-"
echo "SECRET_KEY (from App Runner): ->${SECRET_KEY}<-"
echo "BACKEND_CORS_ORIGINS (from App Runner): ->${BACKEND_CORS_ORIGINS}<-"
# Add any other critical env vars you expect to be set

echo "########## PYTHON AND GUNICORN CHECK ##########"
echo "Python version: $(python --version)"
echo "Gunicorn version: $(gunicorn --version)"
echo "pip freeze output:"
pip freeze

echo "########## ATTEMPTING TO RUN GUNICORN ##########"
echo "Executing: gunicorn -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT app.main:app --log-level debug --access-logfile - --error-logfile -"

# Execute Gunicorn
exec gunicorn -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:${PORT:-8080}" app.main:app --log-level debug --access-logfile - --error-logfile -