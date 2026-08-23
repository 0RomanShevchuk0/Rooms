# Reserved external IPv4 for the app VM. Promoted from the ephemeral address the
# instance already had, so the DNS record and the CI host secret stay valid
# across stop/start cycles.
resource "google_compute_address" "app" {
  name   = "rooms-ip"
  region = "us-central1"
}
