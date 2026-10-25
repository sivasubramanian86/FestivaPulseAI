terraform {
  required_version = ">= 1.7.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.25.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type        = string
  default     = "festivapulse-prod-2026"
  description = "Google Cloud Project ID"
}

variable "region" {
  type        = string
  default     = "asia-south1"
  description = "GCP Region for Cloud Run & Firestore"
}

variable "container_image" {
  type        = string
  default     = "gcr.io/festivapulse-prod-2026/festivapulse-engine:v1.0.0"
  description = "Artifact Registry / GCR Container URI"
}

# Google Cloud Run Service — FestivaPulseAI
resource "google_cloud_run_v2_service" "festivapulse_engine" {
  name     = "festivapulse-engine"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.festivapulse_sa.email

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    containers {
      image = var.container_image

      resources {
        limits = {
          cpu    = "2000m"
          memory = "2Gi"
        }
      }

      env {
        name  = "ENVIRONMENT"
        value = "production"
      }
      env {
        name  = "ENABLE_FIRESTORE"
        value = "true"
      }
      env {
        name  = "ENABLE_PUBSUB"
        value = "true"
      }
      env {
        name  = "ENABLE_CLOUD_MONITORING"
        value = "true"
      }
      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "CORS_ORIGINS"
        value = "https://festivapulse.app,https://admin.festivapulse.app"
      }

      ports {
        container_port = 8000
      }

      startup_probe {
        http_get {
          path = "/api/v1/health"
          port = 8000
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/api/v1/health"
          port = 8000
        }
        period_seconds = 15
      }
    }
  }

  depends_on = [
    google_project_iam_member.sa_vertex_ai,
    google_project_iam_member.sa_firestore,
    google_project_iam_member.sa_pubsub_pub,
    google_project_iam_member.sa_monitoring,
  ]
}

# Cloud Pub/Sub Topics
resource "google_pubsub_topic" "live_telemetry" {
  name = "festivapulse-live-telemetry"
}

resource "google_pubsub_topic" "chaos_events" {
  name = "festivapulse-chaos-events"
}

# Cloud Firestore Native Database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}
