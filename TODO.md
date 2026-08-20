## Issues & Missing

### Security
- [] No rate limiting on API and sockets
- [ ] Refresh token revocation/rotation: store token state server-side and invalidate on logout

### Code Quality
- [ ] No tests (unit or e2e)
- [ ] No tests for Room WS presence edge cases (multi-tab/device, repeated CONNECT, HTTP leave with active socket)
- [ ] Test Winston logger flow for snake settings errors

### Infrastructure
- [ ] Set per-container memory limits in `docker-compose.prod.yml`. The host has 1 GB and no limits are set, so a leak in one service gets a random neighbour killed by the OOM killer instead of the culprit
- [ ] Add a 2 GB swap file and persist it in `/etc/fstab`. Idle usage is ~244 MiB of 955 MiB, so this is headroom for deploys and traffic spikes, not a current shortage
- [ ] Tag images with the commit SHA instead of `latest`, so the running version is identifiable and rollback is possible
- [ ] Enable `trust proxy` in Nest so `X-Forwarded-For` from Caddy yields real client IPs (needed before rate limiting is worth anything)
- [ ] Prune dangling images on the server periodically — every `latest` pull leaves the previous image behind on a 30 GB disk
- [ ] Update OAuth callback URLs to the real domain now that HTTPS is live

### Features
- [ ] OAuth

### Fix Google OAuth callback to use frontend proxy

Update the Google OAuth callback flow so that the callback URL uses the same public domain as the frontend instead of pointing directly to the backend.

**Why:** The frontend uses a proxy/rewrite (`/api/* → backend`), so all authentication-related requests should appear under the same domain. This ensures cookies are scoped consistently and the production OAuth flow works correctly when frontend and backend are hosted on different domains.

**Dev:**

- Change `GOOGLE_CALLBACK_URL` from `http://localhost:4000/api/auth/google-redirect` to `http://localhost:3000/api/auth/google-redirect`.
- Update the same URL in Google Cloud Console → Authorized redirect URIs.

**Production:**

- Set `GOOGLE_CALLBACK_URL` to `https://rooms.app/api/auth/google-redirect`.
- Add the same URL to Google Cloud Console → Authorized redirect URIs.
- Do not use `https://api.rooms.app/...` or the direct backend origin as the Google OAuth callback.

**Expected flow:**
`Google → rooms.app/api/auth/google-redirect → frontend proxy → backend`

- [ ] Room WS presence: support multiple tabs/devices per participant, clean previous socket context on repeated CONNECT, and sync in-memory presence on HTTP leave (no ghost online users)
- [ ] No typing indicators
- [ ] No user profile page
- [ ] Invite only copies room ID — no generated links
