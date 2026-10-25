# ==============================================================================
# Stage 1: Build Frontend Assets
# ==============================================================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Production Python Backend Runtime
# ==============================================================================
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

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

# Copy built frontend assets into static web serving location
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Non-root user for SAIF least-privilege security
RUN useradd -m -u 1001 festivapulse && \
    chown -R festivapulse:festivapulse /app
USER festivapulse

EXPOSE 8080

# Run FastAPI with Uvicorn on Google Cloud Run $PORT
CMD exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 2
