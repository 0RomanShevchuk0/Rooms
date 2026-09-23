# One block describes every region. Adding or removing a region is one line in
# the map below; Terraform creates or destroys the address and the machine.
# Only the US regions are inside Always Free — anything else draws on credits.
locals {
  # machine_type is optional per entry and falls back below, so an entry only
  # spells out what differs from the rest.
  instances = {
    us = { region = "us-central1", zone = "us-central1-a", domain = "rooms-rs.duckdns.org" }
    eu = { region = "europe-west1", zone = "europe-west1-b", domain = "rooms-rs-eu.duckdns.org" }
  }
}

# Reserved up front so the DNS record and the CI host secret survive stop/start.
resource "google_compute_address" "app" {
  for_each = local.instances

  name   = "rooms-${each.key}-ip"
  region = each.value.region
}

# Provisioned entirely by startup.sh: Docker, the repository, the environment
# file from Secret Manager, and the running stack.
resource "google_compute_instance" "app" {
  for_each = local.instances

  name         = "rooms-${each.key}"
  machine_type = try(each.value.machine_type, "e2-micro")
  zone         = each.value.zone

  # Firewall rules on the default network match on these tags.
  tags = ["http-server", "https-server"]

  # The domain differs per machine, so it cannot live in the shared secret. It
  # arrives as metadata and startup.sh folds it into the environment file.
  metadata = {
    ssh-keys = local.ssh_keys
    domain   = each.value.domain
  }

  metadata_startup_script = file("${path.module}/startup.sh")

  service_account {
    email  = google_service_account.app.email
    scopes = ["cloud-platform"]
  }

  boot_disk {
    initialize_params {
      # An image family, so a rebuilt machine comes up with current patches.
      image = "ubuntu-os-cloud/ubuntu-minimal-2404-lts-amd64"
      size  = 30
      type  = "pd-standard"
    }
  }

  network_interface {
    network    = "default"
    subnetwork = "default"

    access_config {
      nat_ip = google_compute_address.app[each.key].address
    }
  }
}
