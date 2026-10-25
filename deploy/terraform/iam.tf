# FestivaPulseAI — IAM Least Privilege Governance
# Adheres to @10_security_governance and Google Cloud CIS Benchmark.
# Enforces strictly zero roles/owner, zero roles/editor, and zero broad administrative roles.

resource "google_service_account" "festivapulse_sa" {
  account_id   = "festivapulse-engine-sa"
  display_name = "FestivaPulseAI Runtime Service Account"
  description  = "Dedicated least-privilege service account for Cloud Run engine"
}

# 1. Vertex AI Gemini Inference Only
resource "google_project_iam_member" "sa_vertex_ai" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.festivapulse_sa.email}"
}

# 2. Cloud Firestore App User (CRUD on celebrations collection)
resource "google_project_iam_member" "sa_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.festivapulse_sa.email}"
}

# 3. Cloud Pub/Sub Publisher (Telemetry & Chaos stream emission)
resource "google_project_iam_member" "sa_pubsub_pub" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.festivapulse_sa.email}"
}

# 4. Cloud Pub/Sub Subscriber (Inbound Chaos event intake)
resource "google_project_iam_member" "sa_pubsub_sub" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.festivapulse_sa.email}"
}

# 5. Cloud Monitoring Metric Writer (Custom SLO metrics)
resource "google_project_iam_member" "sa_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.festivapulse_sa.email}"
}

# 6. Cloud Logging Log Writer (Structured JSON telemetry)
resource "google_project_iam_member" "sa_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.festivapulse_sa.email}"
}

# 7. Cloud Trace Agent (Distributed tracing across ADK swarm)
resource "google_project_iam_member" "sa_trace" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.festivapulse_sa.email}"
}
