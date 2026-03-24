## Issues & Missing

### Security
- [] No rate limiting on API and sockets
- [ ] Refresh token revocation/rotation: store token state server-side and invalidate on logout

### Code Quality
- [ ] No tests (unit or e2e)
- [ ] No tests for Room WS presence edge cases (multi-tab/device, repeated CONNECT, HTTP leave with active socket)

### Features
- [ ] Room WS presence: support multiple tabs/devices per participant, clean previous socket context on repeated CONNECT, and sync in-memory presence on HTTP leave (no ghost online users)
- [ ] No typing indicators
- [ ] No user profile page
- [ ] Invite only copies room ID — no generated links
