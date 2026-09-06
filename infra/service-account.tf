# An identity for the VM itself, separate from the project-wide default account.
# Anything granted here applies only to machines that run as this account.
resource "google_service_account" "app" {
  account_id   = "rooms-app"
  display_name = "Rooms application VM"
}

# The only permission it gets: read this one secret. Not "read secrets", not
# "read anything in the project" — this secret, read-only.
resource "google_secret_manager_secret_iam_member" "app_env" {
  secret_id = google_secret_manager_secret.env.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.app.email}"
}
