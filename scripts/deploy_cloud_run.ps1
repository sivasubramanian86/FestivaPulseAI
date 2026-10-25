# ==============================================================================
# FestivaPulseAI — Google Cloud Run Deployment Script (PowerShell)
# ==============================================================================
param (
    [string]$ProjectId = $env:GCP_PROJECT_ID,
    [string]$Region = "us-central1",
    [string]$ServiceName = "festivapulse-ai"
)

$ErrorActionPreference = "Stop"

if (-not $ProjectId) {
    try {
        $ProjectId = (gcloud config get-value project 2>$null).Trim()
    } catch {
        Write-Host "ERROR: Unable to detect GCP Project ID. Pass -ProjectId <ID> or set GCP_PROJECT_ID." -ForegroundColor Red
        exit 1
    }
}

$ImageTag = "gcr.io/$ProjectId/${ServiceName}:latest"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Deploying FestivaPulseAI to Google Cloud Run             " -ForegroundColor Cyan
Write-Host " Project:  $ProjectId" -ForegroundColor Cyan
Write-Host " Region:   $Region" -ForegroundColor Cyan
Write-Host " Service:  $ServiceName" -ForegroundColor Cyan
Write-Host " Image:    $ImageTag" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Enable GCP Services
Write-Host "`n[1/4] Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable `
    run.googleapis.com `
    cloudbuild.googleapis.com `
    aiplatform.googleapis.com `
    secretmanager.googleapis.com `
    firestore.googleapis.com `
    --project=$ProjectId

# 2. Cloud Build
Write-Host "`n[2/4] Submitting container build to Google Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --tag $ImageTag --project=$ProjectId

# 3. Cloud Run Deploy
Write-Host "`n[3/4] Deploying container image to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --image=$ImageTag `
    --platform=managed `
    --region=$Region `
    --allow-unauthenticated `
    --memory=1Gi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=5 `
    --set-env-vars="ENVIRONMENT=production,GEMINI_MODEL=gemini-2.5-flash,GCP_PROJECT_ID=$ProjectId" `
    --project=$ProjectId

# 4. Display URL
$ServiceUrl = (gcloud run services describe $ServiceName --platform=managed --region=$Region --format="value(status.url)" --project=$ProjectId).Trim()
Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host " Live URL: $ServiceUrl" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
