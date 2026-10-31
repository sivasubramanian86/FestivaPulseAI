# ==============================================================================
# FestivaPulseAI — Production Cloud Run Backend Container (FastAPI)
# ==============================================================================
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    ENVIRONMENT=production

# Install minimal OS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/
COPY pyproject.toml ./

# Non-root user for SAIF least-privilege security
RUN useradd -m -u 1001 festivapulse && \
    chown -R festivapulse:festivapulse /app
USER festivapulse

EXPOSE 8080

# Run FastAPI with Uvicorn on Cloud Run $PORT (1 worker per container for unified memory & SQLite concurrency)
CMD exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1
