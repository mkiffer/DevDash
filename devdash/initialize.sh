#!/bin/bash
set -e

# Ensure script is executable
chmod +x initialize.sh

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from example template..."
    cp .env.example .env
    echo "Please edit the .env file to add your API keys."
else
    echo ".env file already exists. Skipping creation."
fi

# Make the migration script executable
chmod +x backend/scripts/migrate.sh

# Start the containers
echo "Starting Docker containers..."
docker-compose up -d

# Wait for the backend to be ready
echo "Waiting for services to initialize..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose exec backend python -m migrations.migrate --alembic

echo "Initialization complete!"
echo "You can access:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:8000"
echo "- Database: localhost:5432"