terraform {
  required_version = "~> 1.15"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.45"
    }
  }
}

# Credentials are not configured here on purpose: the provider picks up the
# Application Default Credentials written by
# `gcloud auth application-default login`, so no secret ends up in this file.
provider "google" {
  project = "rooms-503509"
  region  = "us-central1"
  zone    = "us-central1-a"
}

locals {
  # Personal keys only. The production instance still carries the expired
  # google-ssh entries the console added; they are left alone to avoid drift.
  ssh_keys = join("\n", [
    "roman:ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKf+y7GLsfjDQhgMDkychm5id/xlLz4SLRAlYMwighVn roman",
    "roman:ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE7XctIcZtCNV3DhxbN2D7HDfmySBpCpGWiiEzWW8yfG roman",
  ])
}
