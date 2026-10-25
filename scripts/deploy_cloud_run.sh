#!/usr/bin/env bash
# ==============================================================================
# FestivaPulseAI — Google Cloud Run Deployment Script (POSIX / Bash)
# ==============================================================================
set -e

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${GCP_SERVICE_NAME:-festivapulse-ai}"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "=========================================================="
echo " Deploying FestivaPulseAI to Google Cloud Run             "
echo " Project:  ${PROJECT_ID}                                  "
echo " Region:   ${REGION}                                      "
echo " Service:  ${SERVICE_NAME}                                "
echo " Image:    ${IMAGE_TAG}                                   "
echo "=========================================================="

if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: GCP_PROJECT_ID is not set. Run 'gcloud config set project <ID>' first."
    exit 1
fi

# Enable necessary Google Cloud APIs
echo "[1/4] Ensuring required GCP APIs are active..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    aiplatform.googleapis.com \
    secretmanager.googleapis.com \
    firestore.googleapis.com \
    --project="${PROJECT_ID}"

# Build container image with Google Cloud Build
echo "[2/4] Submitting container build to Cloud Build..."
gcloud builds submit --tag "${IMAGE_TAG}" --project="${PROJECT_ID}"

# Deploy to Cloud Run
echo "[3/4] Deploying container image to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
    --image="${IMAGE_TAG}" \
    --platform=managed \
    --region="${REGION}" \
    --allow-unauthenticated \
    --memory=1Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=5 \
    --set-env-vars="ENVIRONMENT=production,GEMINI_MODEL=gemini-2.5-flash,GCP_PROJECT_ID=${PROJECT_ID}" \
    --project="${PROJECT_ID}"

# Display service URL
echo "[4/4] Deployment successful!"
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform=managed --region="${REGION}" --format="value(status.url)" --project="${PROJECT_ID}")
echo "=========================================================="
echo " FestivaPulseAI Live URL: ${SERVICE_URL}                 "
echo "=========================================================="
