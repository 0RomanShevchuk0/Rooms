#!/bin/bash
# Runs as root on first boot, once, before anyone logs in.
# Output goes to /var/log/syslog and to the serial console.
set -euo pipefail

echo "=== rooms startup script begin ==="

# Cloud images run unattended-upgrades on boot, which holds the apt lock. Wait
# instead of racing it, otherwise the Docker install fails intermittently.
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
   echo "waiting for the apt lock..."
   sleep 5
done

apt-get update -y
# jq is needed to pull fields out of the metadata and Secret Manager responses.
apt-get install -y git jq

# Official convenience script: adds Docker's repository and installs the engine.
curl -fsSL https://get.docker.com | sh

# Checking for .git rather than the directory: a clone that died halfway leaves
# the directory behind, and skipping it would hide a broken checkout.
if [ -d /opt/rooms/.git ]; then
   echo "rooms repo already present, skipping clone"
else
   echo "cloning rooms repo..."
   git clone -b dev https://github.com/0RomanShevchuk0/Rooms.git /opt/rooms
fi

METADATA=http://metadata.google.internal/computeMetadata/v1
HEADER="Metadata-Flavor: Google"

# The project id comes from the metadata server too, so this script is not tied
# to one project and can be reused as-is.
PROJECT=$(curl -sf -H "$HEADER" "$METADATA/project/project-id")

# The VM proves who it is to the metadata server simply by being itself; no
# credential is stored on disk anywhere.
TOKEN=$(curl -sf -H "$HEADER" \
   "$METADATA/instance/service-accounts/default/token" | jq -r .access_token)

echo "fetching the environment file from Secret Manager..."
curl -sf -H "Authorization: Bearer $TOKEN" \
   "https://secretmanager.googleapis.com/v1/projects/$PROJECT/secrets/rooms-env/versions/latest:access" \
   | jq -r .payload.data | base64 -d > /opt/rooms/.env

# Contains the database password and the JWT secrets.
chmod 600 /opt/rooms/.env

echo "starting the stack..."
cd /opt/rooms
docker compose pull
docker compose up -d

echo "=== rooms startup script done ==="
