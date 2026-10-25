# FestivaPulseAI — Cloud Monitoring & Alert Policies
# Adheres to @20_monitoring_observability and SRE Production Invariants.

resource "google_monitoring_notification_channel" "email_coordinator" {
  display_name = "FestivaPulse Event Command Center Email Alerts"
  type         = "email"
  labels = {
    email_address = "siva@festivapulse.org"
  }
}

# Alert 1: Latency SLO Breach (> 1500ms on 95th percentile)
resource "google_monitoring_alert_policy" "latency_slo_breach" {
  display_name = "FestivaPulseAI — Latency SLO Breach (> 1.5s)"
  combiner     = "OR"

  conditions {
    display_name = "High Request Latency"
    condition_threshold {
      filter          = "metric.type=\"custom.googleapis.com/festivapulse/gemini_inference_latency_ms\" resource.type=\"cloud_run_revision\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 1500
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_95"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_coordinator.name]
}

# Alert 2: High Error Rate (> 1% 5xx errors)
resource "google_monitoring_alert_policy" "error_rate_breach" {
  display_name = "FestivaPulseAI — API 5xx Error Rate > 1%"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run 5xx Server Errors"
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" resource.type=\"cloud_run_revision\" response_code_class=\"5xx\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email_coordinator.name]
}
