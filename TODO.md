## Issues & Missing

### Security
- [ ] WebSocket auth — no JWT validation on socket connections, any client can connect
- [ ] Message sending via socket has no permission check (only `getMessages` HTTP endpoint validates)
- [ ] No input validation on socket payloads (no DTOs)
- [ ] No rate limiting on API and sockets

### Code Quality
- [x] ~~Typo `partisipants` instead of `participants` across the entire API~~
- [ ] No tests (unit or e2e)
- [x] ~~FSD violation: `features/chat` и `features/room-presence` импортят сокет-хуки из `@/app/_providers/ws` — заменили провайдеры на Zustand stores в `shared/lib/realtime/`~~
- [ ] FSD violation: циклическая type-зависимость между `entities/room` ↔ `entities/user` — вынести общие доменные типы в `shared/model/`

### Features
- [ ] Gameplay logic — "Ready" button, timer, game state, rules — all hardcoded placeholders
- [ ] Room settings (Speed, Grid, Play To, Fruits) — static, not editable
- [ ] No typing indicators
- [ ] No message editing/deletion
- [ ] No user profile page
- [ ] Invite only copies room ID — no generated links
