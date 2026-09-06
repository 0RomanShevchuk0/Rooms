# Enabling an API is itself a resource — the same thing the "Enable" button in
# the console does, written down so a fresh project can reproduce it.
resource "google_project_service" "secretmanager" {
  service = "secretmanager.googleapis.com"

  # Leave the API on if this block is ever removed; disabling it would break
  # anything else in the project that relies on it.
  disable_on_destroy = false
}

# Only the container is managed here. The value lives in a secret *version*,
# added out of band with gcloud, so the contents of .env never reach this
# repository or the Terraform state file.
resource "google_secret_manager_secret" "env" {
  secret_id = "rooms-env"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}
