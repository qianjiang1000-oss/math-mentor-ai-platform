# Math Mentor AI Deployment Guide

This guide covers deploying Math Mentor AI to various environments.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Production Checklist](#production-checklist)
5. [Monitoring & Maintenance](#monitoring--maintenance)

## Local Development

### Prerequisites
- Python 3.8+
- Node.js 16+
- SQLite
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/math-tutor-platform.git
   cd math-tutor-platform

    Run setup script
    bash

# Linux/Mac
./scripts/setup.sh

# Windows
scripts/setup.bat

Start services
bash

    # Terminal 1 - Backend
    cd backend
    python app.py

    # Terminal 2 - Frontend
    cd frontend
    npm start

    Access application

        Frontend: http://localhost:3000

        Backend API: http://localhost:5000

Docker Deployment
Prerequisites

    Docker 20.10+

    Docker Compose 2.0+

Quick Deployment

    Deploy with Docker Compose
    bash

docker-compose -f docker/docker-compose.yml up -d --build

Check status
bash

    docker-compose -f docker/docker-compose.yml logs -f

    Access application

        Frontend: http://localhost:3000

        Backend: http://localhost:5000

Custom Configuration

    Environment variables
    Create .env file in project root:
    env

# Database
DATABASE_URL=sqlite:///database/math_tutor.db

# Security
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Deployment
PORT=5000
FLASK_ENV=production

Build custom images
bash

    docker-compose -f docker/docker-compose.yml build --no-cache

Docker Commands

View logs:
bash

docker-compose -f docker/docker-compose.yml logs -f

Stop services:
bash

docker-compose -f docker/docker-compose.yml down

Restart services:
bash

docker-compose -f docker/docker-compose.yml restart

Update deployment:
bash

git pull
docker-compose -f docker/docker-compose.yml up -d --build

Cloud Deployment
AWS Elastic Beanstalk

    Install EB CLI
    bash

pip install awsebcli

Initialize EB
bash

eb init math-mentor-ai --platform python-3.9

Create environment
bash

eb create production

Deploy
bash

    eb deploy

Heroku

    Install Heroku CLI

    Create app
    bash

heroku create math-mentor-ai

Set buildpacks
bash

heroku buildpacks:add heroku/python
heroku buildpacks:add heroku/nodejs

Deploy
bash

    git push heroku main

DigitalOcean App Platform

    Create app.yaml
    yaml

    name: math-mentor-ai
    services:
    - name: web
      source_dir: /
      github:
        branch: main
        repo: username/math-tutor-platform
      run_command: cd backend && python app.py
      environment_slug: python-3.9
      instance_size_slug: basic-xxs
      instance_count: 1

    Deploy via DigitalOcean dashboard

Production Checklist
Security

    Change default secrets and passwords

    Enable HTTPS with SSL certificate

    Configure firewall rules

    Set up rate limiting

    Enable CORS for trusted domains only

    Validate all user inputs

    Use environment variables for secrets

Database

    Regular backups configured

    Database optimization

    Connection pooling

    Migration scripts ready

    Monitoring enabled

Performance

    CDN for static assets

    Gzip compression enabled

    Image optimization

    Cache headers configured

    Load testing completed

Monitoring

    Error tracking (Sentry)

    Performance monitoring

    Uptime monitoring

    Log aggregation

    Alerting configured

Environment Configuration
Backend Environment
env

# Flask Configuration
FLASK_ENV=production
PORT=5000
SECRET_KEY=your-super-secret-production-key
JWT_SECRET_KEY=your-jwt-production-secret-key

# Database
DATABASE_URL=sqlite:///database/math_tutor.db

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Model Configuration
MODEL_PATH=./models
VOCAB_SIZE=10000
MAX_SEQUENCE_LENGTH=128
EMBEDDING_DIM=128

# Training
TRAINING_EPOCHS=100
BATCH_SIZE=32
VALIDATION_SPLIT=0.2

Frontend Environment
env

REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_WS_URL=wss://api.yourdomain.com
REACT_APP_VERSION=2.0.0
GENERATE_SOURCEMAP=false

Database Management
Backup Strategy
bash

# Daily backup
0 2 * * * /app/scripts/backup_database.py

# Backup retention (keep 7 days)
0 3 * * * /app/scripts/backup_database.py --cleanup

Migration Steps

    Create backup
    bash

python scripts/backup_database.py

Run migrations
bash

python database/init_database.py

Verify data integrity
bash

    python scripts/verify_database.py

Monitoring & Maintenance
Health Checks
bash

# API health check
curl -f https://api.yourdomain.com/api/health

# Database health
python scripts/check_database.py

# Model health
python scripts/check_model.py

Log Management
bash

# View logs
docker-compose logs -f

# Log rotation
# Add to /etc/logrotate.d/math-mentor-ai
/var/log/math-mentor-ai/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}

Performance Monitoring

    Response times: < 500ms for API calls

    Error rate: < 1% of requests

    Uptime: > 99.9%

    Memory usage: < 80% of available

    CPU usage: < 70% average

Scaling Strategies
Horizontal Scaling
yaml

# docker-compose.yml
services:
  backend:
    scale: 3
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M

Database Scaling

    Use PostgreSQL for production

    Implement connection pooling

    Set up read replicas

    Configure database clustering

Caching

    Redis for session storage

    CDN for static assets

    Response caching

    Query caching

Security Best Practices
Network Security

    Use VPC and security groups

    Enable DDoS protection

    Configure WAF rules

    Regular security scans

Application Security

    Regular dependency updates

    Security headers configured

    Input validation and sanitization

    Rate limiting enabled

Data Protection

    Encryption at rest and in transit

    Regular security audits

    Access control policies

    Data retention policies

Troubleshooting
Common Issues
Database Connection Issues
bash

# Check database file
ls -la database/

# Check permissions
chmod 644 database/math_tutor.db

# Repair database
sqlite3 database/math_tutor.db ".dump" | sqlite3 database/math_tutor_new.db

Model Loading Issues
bash

# Check model files
ls -la backend/models/

# Rebuild model
python backend/train_ai.py

Performance Issues
bash

# Monitor resources
docker stats

# Check logs
docker-compose logs --tail=100

# Restart services
docker-compose restart

Recovery Procedures
Database Recovery

    Stop services

    Restore from backup

    Verify data integrity

    Start services

Model Recovery

    Retrain model

    Verify accuracy

    Deploy new model

    Monitor performance

Cost Optimization
Infrastructure Costs

    Use spot instances for training

    Implement auto-scaling

    Use reserved instances

    Monitor and optimize resource usage

Storage Costs

    Implement data lifecycle policies

    Use compressed backups

    Clean up old logs and files

    Use cost-effective storage classes

Support & Resources
Documentation

    API Documentation

    User Guide

    Contributing Guide

Community Support

    GitHub Issues

    Community Forum

    Discord Channel

    Stack Overflow

Professional Support

    Email support: support@mathmentor.ai

    SLAs available for enterprise

    Custom deployment services

    Training and consulting

Version Updates
Update Process

    Check current version
    bash

curl https://api.yourdomain.com/api/health | jq .version

Pull updates
bash

git pull origin main

Run migrations
bash

python database/init_database.py

Rebuild and deploy
bash

docker-compose up -d --build

Verify deployment
bash

    curl -f https://api.yourdomain.com/api/health

Rollback Procedure

    Revert to previous version
    bash

git checkout v1.2.3

Restore database backup
bash

python scripts/restore_backup.py backup_20231201.db

Redeploy previous version
bash

    docker-compose up -d --build

Last updated: January 2024