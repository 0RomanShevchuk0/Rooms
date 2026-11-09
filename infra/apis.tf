# A new project starts with these APIs off. Enabling Compute also creates the
# default network, but only a minute or so later, so on a fresh project apply
# these first with -target and the machines afterwards.
resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iam" {
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}
