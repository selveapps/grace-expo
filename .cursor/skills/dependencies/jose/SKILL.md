---
name: jose
description: >-
  JWT signing and verification for grace-api guest auth using jose (HS256).
  Use when editing auth routes, JWT middleware, or debugging 401 responses.
---

# jose (grace-api JWT)

## Official docs

https://github.com/panva/jose

## Implementation

| File | Role |
|------|------|
| `src/lib/jwt.ts` | sign/verify access + refresh tokens |
| `src/services/authService.ts` | guest login, refresh, user lookup |
| `src/middleware/auth.ts` | `requireAuth` preHandler |

## Token shape

- **Access:** 1h TTL, payload `{ type: 'access', sub: userId }`
- **Refresh:** 30d TTL, payload `{ type: 'refresh', sub: userId }`
- **Algorithm:** HS256 with `JWT_SECRET` env var

## Routes

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/guest` `{ deviceId }` | Public |
| POST | `/auth/refresh` `{ refresh }` | Public |
| GET | `/me` | Bearer access token |

## Verify

```bash
cd backend && npm test -- --test-name-pattern "guest JWT"
```

## Surprises

`curl -sf` treats HTTP 401 as failure — use `curl -s` when checking status codes (see `SURPRISES.md`).
