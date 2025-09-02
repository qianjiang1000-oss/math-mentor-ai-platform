#!/bin/bash

echo "=== Math Mentor AI Platform Production Deployment ==="

# Generate secure secret key
SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
export SECRET_KEY

# Pull latest code
git pull origin main

# Build and deploy
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml build
docker-compose -f docker/docker-compose.yml up -d

# Initialize database
echo "Initializing database..."
docker-compose -f docker/docker-compose.yml exec backend python init_database.py

# Run initial training if needed
echo "Running initial training..."
docker-compose -f docker/docker-compose.yml exec backend python train_ai.py

echo "Deployment completed!"
echo "Frontend: http://yourdomain.com"
echo "Backend API: http://yourdomain.com/api"