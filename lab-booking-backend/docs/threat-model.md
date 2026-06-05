# Threat Model — INES Lab Booking API

## Top 3 Risks and Mitigations

---

### Risk 1: Brute-Force Password Attack

**Description:** An attacker tries many passwords against a known user account to gain unauthorised access. Without protection, a single `/auth/login` endpoint can be hit thousands of times per minute.

**Mitigations:**
- **Rate limiting** on `POST /auth/login` at **5 requests per minute per IP** using `express-rate-limit`.
- **Bcrypt** password hashing with a high cost factor (10 rounds), making each guess computationally expensive.
- Generic error messages ("Invalid email or password") — no information leakage about whether the email exists.
- Account deactivation field (`is_active`) for manual lockout by administrators.

**Severity:** High
**Likelihood:** High

---

### Risk 2: JWT Token Theft / Session Hijacking

**Description:** An attacker steals a user's JWT access token (via XSS, network interception, or device theft) and uses it to impersonate the user against the API.

**Mitigations:**
- **Short-lived access tokens** (15 minutes) — stolen tokens have a limited window of use.
- **Refresh token rotation** — each refresh call invalidates the old refresh token and issues a new one. Stolen refresh tokens are automatically revoked on use.
- Tokens are **not stored in cookies** (handled client-side), reducing CSRF risk.
- `helmet` middleware adds security headers (X-Content-Type-Options, X-Frame-Options, etc.).
- CORS is restricted in production to the known frontend origin.

**Severity:** High
**Likelihood:** Medium

---

### Risk 3: Unauthorised Role Escalation

**Description:** A student or lecturer calls lab-coordinator-only endpoints (e.g., approving bookings) by manipulating the request or by using another user's token.

**Mitigations:**
- **Role-based access control** middleware enforces permissions at the route level:
  - `requireRole('lab-coordinator')` on approval and admin endpoints.
  - Role is embedded in the signed JWT — cannot be tampered with without the secret.
- **Input validation** with Zod ensures malformed requests are rejected at the boundary.
- **Least-privilege principle**: students can only create and view their own bookings; lecturers can book; only coordinators can approve/reject.
- All sensitive operations are logged with the user ID for audit trails.

**Severity:** High
**Likelihood:** Medium

---

## Additional Security Measures

| Category | Measure |
|----------|---------|
| **Headers** | Helmet.js sets security headers (CSP, HSTS, XSS filter) |
| **Logging** | Every request is logged (method, path, status, duration, user ID) |
| **Error handling** | Stack traces never leak to the client in production |
| **Input validation** | Zod validation on all endpoints; field-level 400 errors |
| **SQL injection** | Knex parameterised queries prevent injection |
| **Secrets** | JWT secret, DB credentials loaded from environment variables |

*Last updated: 2 June 2026*
