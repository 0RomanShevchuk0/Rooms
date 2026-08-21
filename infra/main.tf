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
