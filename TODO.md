## Issues & Missing

### Security
- [] No rate limiting on API and sockets
- [ ] Refresh token revocation/rotation: store token state server-side and invalidate on logout

### Code Quality
- [ ] No tests (unit or e2e)
- [ ] No tests for Room WS presence edge cases (multi-tab/device, repeated CONNECT, HTTP leave with active socket)
- [ ] Test Winston logger flow for snake settings errors

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
