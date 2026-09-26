# Production Dockerfile for ISML AI Service
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files & buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt-get/lists/*

# Copy source code
COPY . .

# Install dependencies (supports both root repository context and subfolder context)
RUN if [ -f "requirements.txt" ]; then pip install --no-cache-dir -r requirements.txt; elif [ -f "ai-service/requirements.txt" ]; then pip install --no-cache-dir -r ai-service/requirements.txt; fi

# Expose HTTP port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1


# Start FastAPI app with uvicorn (supports both root repository context and subfolder context)
CMD ["sh", "-c", "if [ -d 'ai-service/app' ]; then PYTHONPATH=ai-service:. exec uvicorn ai-service.app.main:app --host 0.0.0.0 --port ${PORT:-8000}; else PYTHONPATH=. exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}; fi"]



