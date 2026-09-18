# ADR-001: JWT Access Tokens + Opaque Refresh Tokens with Rotation

## Status
Accepted

## Context
Auth Service must issue credentials usable across 8 microservices.
Options:
1. Server-side sessions (JSESSIONID)
2. Long-lived JWT only
3. JWT access token (short TTL) + opaque refresh token (long TTL) with rotation

## Decision
Option 3.

- Access token: JWT, HS256, 15 min TTL. Claims: sub, iss, iat, exp, email, role, name.
  Stateless validation in every service.
- Refresh token: 48 random bytes, base64url, 7 day TTL.
  Stored as SHA-256 hash, delivered as HttpOnly SameSite=Lax cookie.
- Rotation: every `/refresh` revokes the old token and issues a new one.
- Reuse detection: presenting a revoked token revokes ALL user tokens (assumed theft).

## Consequences
+ No server-side session state; horizontal scaling friendly
+ Refresh tokens immune to XSS (HttpOnly)
+ Reuse detection limits blast radius of stolen tokens
+ Stateless validation = no auth service call on every request
- Shared HS256 secret must reach every service (migrate to RS256 + JWKS in V2)
- DB write per refresh (acceptable at this scale)
- Requires HTTPS in prod for `Secure` cookie flag

## Alternatives Rejected
- Sessions: incompatible with stateless microservices
- JWT-only long expiry: cannot revoke before expiry
- RS256 from day one: correct at scale, overkill for V1
