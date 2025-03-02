#!/bin/bash

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Usage: DATABASE_URL='postgresql://user:password@host:port/dbname' ./scripts/deploy_db.sh [--with-data]"
    exit 1
fi

# Set environment for production
export ENVIRONMENT="production"

echo "Running database migrations..."
cd backend
alembic upgrade head

# Import data if requested
if [ "$1" == "--with-data" ]; then
    echo "Importing existing data..."
    python migrations/export_data.py
fi

echo "Database migration complete"