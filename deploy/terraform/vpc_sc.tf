# FestivaPulseAI — VPC Service Controls Perimeter Definition
# Adheres to @10_security_governance. Prevents exfiltration of event data,
# catering schedules, and guest telemetry outside the secure enterprise perimeter.

variable "access_policy_id" {
  type        = string
  default     = "123456789012"
  description = "Organization Access Policy ID"
}

resource "google_access_context_manager_service_perimeter" "festivapulse_perimeter" {
  parent = "accessPolicies/${var.access_policy_id}"
  name   = "accessPolicies/${var.access_policy_id}/servicePerimeters/festivapulse_secure_perimeter"
  title  = "FestivaPulseAI Enterprise Data Security Perimeter"

  status {
    restricted_services = [
      "aiplatform.googleapis.com",   # Vertex AI Gemini inference
      "firestore.googleapis.com",    # Cloud Firestore state
      "pubsub.googleapis.com",       # Cloud Pub/Sub live telemetry
      "run.googleapis.com",          # Cloud Run container runtime
    ]

    resources = [
      "projects/${var.project_id}",
    ]

    vpc_accessible_services {
      enable_restriction = true
      allowed_services = [
        "RESTRICTED-SERVICES",
      ]
    }
  }
}
