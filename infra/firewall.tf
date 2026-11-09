# The default network admits only SSH, RDP and ICMP from outside. Caddy needs
# 80 for the ACME challenge and the HTTPS redirect, and 443 for the site.
resource "google_compute_firewall" "web" {
  name          = "rooms-allow-web"
  network       = "default"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server", "https-server"]

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  depends_on = [google_project_service.compute]
}
