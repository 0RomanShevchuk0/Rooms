## Issues & Missing

### Security

- [ ] No rate limiting on API and sockets
- [ ] Refresh token revocation/rotation: store token state server-side and invalidate on logout

### Infrastructure

- [ ] Set per-container memory limits in `docker-compose.prod.yml`. The host has 1 GB and no limits are set, so a leak in one service gets a random neighbour killed by the OOM killer instead of the culprit
- [ ] Add a 2 GB swap file and persist it in `/etc/fstab`. Idle usage is ~244 MiB of 955 MiB, so this is headroom for deploys and traffic spikes, not a current shortage
- [ ] Tag images with the commit SHA instead of `latest`, so the running version is identifiable and rollback is possible
- [ ] Enable `trust proxy` in Nest so `X-Forwarded-For` from Caddy yields real client IPs (needed before rate limiting is worth anything)
- [ ] Observability: metrics, a dashboard and alerts for the API and sockets

### Features

- [ ] No typing indicators
- [ ] No user profile page
- [ ] Match history: persist finished snake matches (room, settings, participants with place and score) and show them on the user profile
- [ ] Snake replays: replace `Math.random` in `food.ts` and `mock-player.ts` with a seeded RNG, store `seed + settings + [tick, playerId, direction]` per match, move the engine `core` into `packages/` and replay the log on the client with seek and playback speed???
- [ ] Second game, preferably turn-based, to check that the `games/` module is a real abstraction and not snake-shaped. Candidate: Battleship — turn-based, exactly two players (the rest of the room spectates) and hidden state, so the server has to send each player only their own view and never the opponent's ships
