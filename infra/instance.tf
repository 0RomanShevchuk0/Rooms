# The VM that runs the production stack. Originally created by hand in the
# console and adopted into Terraform afterwards.
resource "google_compute_instance" "app" {
  name         = "instance-20260815-133017"
  machine_type = "e2-micro"
  zone         = "us-central1-a"
  project      = "rooms-503509"

  # Firewall rules on the default network match on these tags — this is what the
  # "Allow HTTP/HTTPS traffic" checkboxes actually set.
  tags = ["http-server", "https-server"]

  # Worth flipping to true once the machine is treated as production.
  deletion_protection = false

  # Looks like a default, but dropping it forces the instance to be replaced.
  key_revocation_action_type = "NONE"

  # Managed here because the GCP guest agent syncs these into authorized_keys.
  # The two google-ssh entries are expired leftovers from the console SSH button.
  metadata = {
    ssh-keys = "0romanshevchuk0:ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBMguhsrELVmbnTsL5q5Qtc7MED7R7scXeYitA8tQ5SkvSWulTqUCjvx++o/1TJlAJh1u/Tci1f7K8pYzk2C/bs8= google-ssh {\"userName\":\"0romanshevchuk0@gmail.com\",\"expireOn\":\"2026-08-15T13:50:19+0000\"}\n0romanshevchuk0:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAG+Gk28qsQGtwqwyzjr7WgBwLcDhguGZL3W3efVbnyiNtHo3UK7d92pc+aGPrb663gxjyuE6nwi2YCGFLcVxiUo1xvVa6y6kdZnjwYDj5ALIYKlqmATVi0B4qIYXXEtd2qW10Qu7BPlNifLEcOFcKIBYzd68e6GUxD7+tJWbxB/uBgRagiiumT62fXgjuhkVxDvFyfMGuiyVMJ0CEdGAJt/l0If56FXL1Mb/fThUGbFihI2IoU2wP7VzfmS7PaKviMcLMLF1AUyo2cpqT9vpVvgyxP4Bl7wazBgeVgywKlKIHD6/jIWBvPwG2SWG/++6TqixXLFXLd/IfyVNqnS2ByU= google-ssh {\"userName\":\"0romanshevchuk0@gmail.com\",\"expireOn\":\"2026-08-15T13:50:22+0000\"}\nroman:ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKf+y7GLsfjDQhgMDkychm5id/xlLz4SLRAlYMwighVn roman\nroman:ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE7XctIcZtCNV3DhxbN2D7HDfmySBpCpGWiiEzWW8yfG roman"
  }

  boot_disk {
    auto_delete = true
    mode        = "READ_WRITE"

    initialize_params {
      # Pinned to one exact build because that is what the running disk was made
      # from. Switching to the image family would keep rebuilt machines patched,
      # but it forces the instance to be replaced — do not change casually.
      image = "https://www.googleapis.com/compute/v1/projects/ubuntu-os-cloud/global/images/ubuntu-minimal-2404-noble-amd64-v20260810"
      size  = 30
      type  = "pd-standard"
    }
  }

  network_interface {
    network    = "default"
    subnetwork = "default"

    # The presence of this block is what gives the instance a public IPv4.
    # Pointing it at the reserved address keeps the IP stable across stop/start,
    # which the DNS record and the CI host secret both depend on.
    access_config {
      nat_ip       = google_compute_address.app.address
      network_tier = "PREMIUM"
    }
  }

  service_account {
    email = "891856735888-compute@developer.gserviceaccount.com"
    scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring.write",
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/servicecontrol",
      "https://www.googleapis.com/auth/trace.append",
    ]
  }

  shielded_instance_config {
    enable_integrity_monitoring = true
    enable_secure_boot          = false
    enable_vtpm                 = true
  }
}
