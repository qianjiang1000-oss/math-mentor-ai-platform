#!/bin/bash

# Build and deploy the application
echo "Building Math Mentor AI Platform..."
docker-compose -f docker/docker-compose.yml build

echo "Starting services..."
docker-compose -f docker/docker-compose.yml up -d

echo "Deployment completed! The application is running at http://localhost"