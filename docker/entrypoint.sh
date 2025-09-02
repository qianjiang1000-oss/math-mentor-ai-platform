#!/bin/sh
# Docker entrypoint script

set -e

echo "🔧 Running entrypoint script..."

# Wait for database to be ready (if using external database)
if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    echo "⏳ Waiting for database at $DB_HOST:$DB_PORT..."
    while ! nc -z $DB_HOST $DB_PORT; do
        sleep 0.1
    done
    echo "✅ Database is ready!"
fi

# Initialize database if it doesn't exist
if [ ! -f ../database/math_tutor.db ]; then
    echo "🗄️ Initializing database..."
    python ../database/init_database.py
fi

# Run database migrations (if using migrations)
echo "🔄 Running migrations..."
python ../database/init_database.py

# Collect static files (if needed)
echo "📦 Collecting static files..."
# python manage.py collectstatic --noinput

# Create necessary directories
mkdir -p ../logs ../backups ../database
chmod -R 755 ../logs ../backups ../database

# Set proper permissions
chown -R appuser:appuser /app /app/../logs /app/../backups /app/../database

echo "🚀 Starting application..."
exec "$@"