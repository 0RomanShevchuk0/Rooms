# Infrastructure

Terraform configuration for the machine that runs Rooms on Google Cloud.

## What runs where

```
internet → Caddy (:80, :443)      TLS, routing
              ├── /api/*  →  Nest       WebSockets, REST
              └── /*      →  Next.js    SSR
                                ↓
                            Postgres    private to the compose network
```

Only Caddy publishes ports. The application containers and the database are reachable on the internal network alone.

```
infra/
├── main.tf              provider, versions, project, shared locals
├── instances.tf         one block per region: reserved address + machine
├── secret.tf            Secret Manager API and the secret container
├── service-account.tf   the VM identity and its single permission
├── startup.sh           first-boot provisioning
└── .terraform.lock.hcl  pinned provider versions
```

State is local and gitignored: it records resource values in clear text.

## How a machine provisions itself

`startup.sh` is stored in instance metadata and runs as root on first boot, before anyone logs in:

1. wait for the apt lock — cloud images run unattended upgrades at boot
2. install git, jq and Docker
3. clone the repository into `/opt/rooms`
4. request an access token from the metadata server
5. read the shared environment file from Secret Manager, append the machine's own domain, and write it with mode `600`
6. `docker compose up -d`

No credential is stored on the machine. The metadata server issues a token for the attached service account purely because the request originates inside that instance:

```sh
TOKEN=$(curl -sf -H "Metadata-Flavor: Google" \
   "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token" \
   | jq -r .access_token)
```

That service account holds exactly one permission: read one named secret.

The repository is cloned into `/opt` rather than a home directory because the login user does not necessarily exist yet — the guest agent creates users when a key is first used, and the script runs before any login.

Terraform manages only the secret container. The value is added out of band, since everything Terraform creates is written to state in clear text:

```sh
gcloud secrets versions add rooms-env --data-file=-
```

One secret serves every machine, so it holds only what they share — and nothing that is not actually secret. The domain is neither: it differs per machine and is public anyway, so it travels as instance metadata and the startup script appends `DOMAIN` and `PUBLIC_URL` to the downloaded file. Nothing is overwritten; each source owns its own keys. Anything else that varies per region belongs in the map at the top of `instances.tf`.

`docker-compose.prod.yml` derives `ALLOWED_ORIGINS`, `CLIENT_URL` and both OAuth callback URLs from `PUBLIC_URL`, so setting that one value is enough. Callback URLs still have to be registered per domain in the Google and Discord consoles.

## Notes

Things that are not obvious from the configuration alone.

**A startup script only runs on first boot.** Editing it and applying rebuilds the machine; there is no other way to apply a new one. `sudo google_metadata_script_runner startup` re-runs it in place for debugging, but only a rebuild is an honest test.

**`terraform plan -generate-config-out` produces a snapshot, not a blueprint.** The generated block pins the current ephemeral IP, one exact image build and the existing disk. Useful for import, wrong for recreating.

**Permissions are checked twice.** OAuth scopes decide what a token may reach at all, then IAM decides rights on the resource. Both machines run on `rooms-app` with the `cloud-platform` scope, so IAM alone governs what they can do.

**Addresses are reserved before the machines exist.** The first instance had an ephemeral address; stopping it changed the IP and broke both the DNS record and the CI host secret. Every address is now a `google_compute_address` the instance references, so stop/start cannot change it.

## Commands

```sh
terraform plan                    # show the difference, change nothing
terraform apply                   # resolve it
terraform apply -replace=ADDRESS  # rebuild a single resource
```

```sh
gcloud compute instances list
gcloud compute instances get-serial-port-output NAME --zone ZONE   # boot output, works without SSH
gcloud secrets versions access latest --secret=rooms-env
```

```sh
sudo journalctl -u google-startup-scripts -f    # follow the startup script
cd /opt/rooms && sudo docker compose ps
```

Read a plan by its last line — `Plan: N to add, N to change, N to destroy`. `-/+` means destroy and recreate; `# forces replacement` marks the field responsible.
