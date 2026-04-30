#!/bin/bash

# Wait for database to be ready if needed
echo "🚀 Starting AI Support Copilot Backend..."

# Run database migrations
echo "📂 Running database migrations..."
python -m alembic upgrade head

# Start the application
echo "✨ Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
