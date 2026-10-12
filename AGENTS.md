<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Medora Health — Agent Guide

Company/client project. Restricted inspection mode applies: never read, copy, summarize, or expose secrets, PHI, PII, payment data, or credential files (including `.env` / `.env.*`). If a value looks like a credential, do not repeat it — say only that configuration is required.

Status labels used below:

| Label | Meaning |
|-------|---------|
| **CURRENT** | Verified implemented behavior in this repo |
| **GAP** | Required/expected behavior not fully implemented |
| **PENDING** | Unresolved requirement, missing integration, or needs clarification |
| **QA-ONLY** | Temporary testing shortcut — not production behavior |
| **LEGACY** | Older pattern; do not treat as the target architecture |

---

# Project Overview

Medora Health is a Next.js medical storefront / patient experience integrating with **AsterMD** as the clinical care partner. The browser never calls AsterMD with secrets. All live provider calls go through a Next.js **BFF** (Route Handlers / Server Actions) into server-only AsterMD modules.

```text
User → Next.js UI → BFF (/api/* or server actions) → AsterMD API
```

Vendor-oriented end-to-end reference (not all steps are CURRENT):

Authentication → Channel → Products → Session → Cart → Checkout → Verification → Intake/Teleform → Opportunity → External CRM/payment order → Treatment Sync → Doctor Sync → Journey/order events → Treatment/refill lifecycle

**CURRENT checkpoint stops around:** Authentication → Channel/Product rendering → Session (create/reuse). Later steps are GAP/PENDING unless verified below.

---

# Tech Stack

- Next.js App Router (v16.x) + React 19 + TypeScript
- Tailwind CSS v4 + Radix/shadcn-style UI
- Zod + React Hook Form
- TanStack Query
- Zustand (client channel/session/cart state)
- `server-only` for AsterMD credentials and HTTP

Scripts: `npm run dev` | `build` | `start` | `lint` | `typecheck`

---

# Repository Structure

```text
src/
  app/
    (marketing)/     # Landing, treatments, catalog, cart
    (auth)/          # Login / register shells
    (flow)/          # Eligibility → checkout → verification → intake shells
    (account)/       # Account area UI
    (patient)/       # Redirects / legacy patient routes
    (portal)/        # Redirects toward account
    api/             # BFF route handlers
  components/        # ui, layout, shared
  features/          # catalog, cart, journey, care-flow, account, …
  lib/
    api/astermd/     # Token, channel, session, HTTP client, mocks
    session/         # Visitor session cookie helpers
    security/        # Patient auth placeholder
    domain/          # Domain types
  providers/         # SessionProvider, ChannelProvider, QueryProvider
  stores/            # channel-store, session-store, cart-store
  hooks/             # use-channel, use-visitor-session, use-cart
  config/            # site + metadata
```

Do not rename route groups or replace working BFF patterns without an explicit request.

---

# Architecture Principles

1. **BFF-first:** AsterMD credentials and bearer tokens stay on the server.
2. **Smallest change:** Prefer extending existing modules over rewrites.
3. **Typed payloads:** Prefer explicit types for AsterMD request/response shapes.
4. **Fail soft where possible:** One AsterMD failure should not crash unrelated UI when the product allows degradation.
5. **No invented APIs:** Do not fabricate AsterMD endpoints or billing behavior.
6. **Status honesty:** Mark uncertain behavior PENDING; do not upgrade to CURRENT without verification.

---

# Server vs Client Boundaries

| Concern | Where | Notes |
|---------|-------|-------|
| `client_id` / `client_secret` / API keys | Server only (`lib/env`, AsterMD config) | Never `NEXT_PUBLIC_*` |
| Access token / JWT | Server memory (`token-store`) | Never return to browser |
| Channel catalog | BFF → Zustand (+ 1-day server cache for channel only) | CURRENT |
| Visitor sales session UUID | HttpOnly cookie + session store status | CURRENT |
| Local cart UI state | Zustand persist | **Not** AsterMD cart API yet |
| Patient login session | Placeholder in `lib/security/auth.ts` | GAP |

---

# AsterMD Integration

## Authentication — CURRENT

- `POST {BASE_URL}/v1/auth/api-credentials/token`
- Implemented in `src/lib/api/astermd/auth/token-manager.ts`
- Authenticated calls go through `asterMdFetch` + `request-gate`: other API calls wait until a usable token exists; shared in-flight token request; failures cancel queued calls
- BFF: `/api/astermd/auth/status` (status only — no raw token)

## Channel / Products — CURRENT

- `GET {BASE_URL}/v1/sales/channels/detail/{CHANNEL_ID}`
- Server helper: `channels.ts`; BFF: `GET /api/astermd/channel`
- **Only channel detail responses are cached** (≈1 day server TTL in `channel-cache.ts`). Other AsterMD calls use `cache: "no-store"`.
- Storefront renders channel products via `ChannelProvider` / `useChannel` / catalog components

## Session — CURRENT (visitor sales session)

- `POST {BASE_URL}/v1/sales/sessions/create` with configured `channel_id`
- `GET {BASE_URL}/v1/sales/sessions/view?session_ids=…&tz=…`
- BFF: `POST|GET /api/astermd/session`
- `SessionProvider` ensures a session on page open/navigation:
  - **No cookie** → create
  - **Cookie present** → reuse (avoid duplicate creates)
- Cookie is HttpOnly application runtime state (not Postman env vars)
- Optional `X-Original-Client-Ip` from trusted proxy headers only — do not trust browser-supplied IPs blindly
- **PENDING:** exact AsterMD session expiry / resume semantics (do not invent a duration)

## Cart — GAP / PENDING

- **CURRENT (UI only):** local Zustand cart (`cart-store`) — add/remove, no quantity selector, not synced to AsterMD
- **GAP:** AsterMD cart create/update APIs bound to the same sales session
- Cart conceptually belongs to the AsterMD session/journey once integrated

## Checkout — GAP / PENDING

- UI route shells under `(flow)/checkout` and related journey components exist
- **GAP:** end-to-end checkout against AsterMD / configured payment/CRM
- Do not treat Treatment Sync as the initial payment operation

## Verification — GAP / PENDING

- UI shell: `(flow)/verification`
- Verification is **configuration-dependent** (email, address, identity, DOB, SSN, IP/geo — not all may be enabled)
- Team context: missing/unconfigured verification integration → treat as **GAP/PENDING**
- Never use real patient identity data; synthetic placeholders only
- Mark QA bypasses **QA-ONLY**

## Teleform / Intake — PENDING

Architectural reference (verify APIs before coding):

Product/channel mapping → Teleform/form id → schema/JSON id → schema retrieval → UI render → intake submit/update

- Do not hardcode medical question content when schema should drive the UI
- Preserve schema field mappings
- Intake may later update Opportunity
- Repo has intake UI/mocks and placeholder paths; live Teleform wiring is **PENDING**

## Opportunity — PENDING

- Represents evolving lead/patient journey data
- Prefer create once when appropriate → update as contact/verification/intake data arrives
- Do not assume recreate-on-every-step
- Not fully implemented as live AsterMD opportunity APIs in this repo

## Payment / CRM — GAP / PENDING

- Storefront KT: payment/order creation owned by configured storefront/CRM/payment integration
- **GAP:** payment integration not confirmed end-to-end
- **GAP:** successful external order-ID creation not verified
- **PENDING:** subscription-specific payment/renewal API behavior
- Do not invent a separate AsterMD “Monthly Subscription API”
- Never expose raw card/PAN data in app logs or client storage

## Treatment Sync — PENDING

- Downstream of a successful external order context — not the payment itself
- When it runs (initial vs recurring) **PENDING** confirmation

## Doctor Sync — PENDING

- Provider/network dependent; do not assume every network supports every feature
- When re-sync is required on renewals **PENDING**

## Patient / Treatment Lifecycle — PENDING / LEGACY mix

- Recurring clinical lifecycle ≈ Treatment + Orders/Refills (AsterMD)
- Recurring money ≈ configured CRM/payment system
- Patient portal / account UIs exist; live sync behavior **PENDING**
- Older patient/portal redirects may coexist — treat obsolete paths as **LEGACY** when they only redirect

### Journey / events — PENDING

- Session create seeds visit journey server-side; richer journey event tracking across cart/checkout/intake is **PENDING**

---

# Current Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| Authentication / token | CURRENT | Server token manager + request gate |
| Channel API | CURRENT | Detail by env channel id; 1-day cache |
| Product rendering | CURRENT | Channel products in storefront |
| Session create / reuse | CURRENT | BFF + HttpOnly cookie + SessionProvider |
| Session view / journey load | CURRENT | Via BFF GET; expiry semantics PENDING |
| Local cart UI | CURRENT | Client-only; not AsterMD cart |
| AsterMD cart API | GAP | Not wired |
| Checkout (live) | GAP/PENDING | UI shells only |
| Verification | GAP | Unconfigured / not end-to-end |
| Teleform / intake (live) | PENDING | Schema-driven flow not complete |
| Opportunity | PENDING | Not fully integrated |
| Payment / external order ID | GAP | Not verified |
| Treatment Sync | PENDING | — |
| Doctor Sync | PENDING | — |
| Recurring billing APIs | PENDING | Do not invent |
| Patient auth (real) | GAP | Placeholder patient id |
| Channel-only response cache | CURRENT | Do not cache other AsterMD APIs the same way |

---

# Security & Privacy Rules

- Never open or dump `.env`, `.env.*`, vault contents, or credential files.
- Never print tokens, secrets, PHI, PII, card data, or full sensitive payloads.
- AsterMD secrets: server-only modules; never `NEXT_PUBLIC_*` for secrets.
- Do not store PHI in `localStorage`.
- Visitor session cookie is HttpOnly; prefer cookie over localStorage for session id.
- Synthetic test data only for identity/clinical examples.
- This guide does not claim HIPAA compliance by itself.

---

# Environment Variable Rules

Mention **names only** (never values). Names visible in safe server env schema / README:

| Name pattern | Public? | Role |
|--------------|---------|------|
| `APP_ENV` | No | `dev` \| `prod` credential set switch |
| `ASTERMD_DEV_*` / `ASTERMD_PROD_*` | No | Base URL, client id, secret, channel id, api key |
| `ASTERMD_USE_MOCK` | No | Mock vs live AsterMD service |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL |
| `NEXT_PUBLIC_ASTERMD_CDN_URL` | Yes | Public CDN base for product images (may 403 if bucket private) |

Required configuration must be described without embedding secret values.

---

# Coding Conventions

Inferred from the repo:

- App Router route groups: `(marketing)`, `(flow)`, `(account)`, …
- Feature folders under `src/features/*`
- AsterMD under `src/lib/api/astermd/*` with `server-only`
- BFF under `src/app/api/**/route.ts`
- Client state: Zustand stores + hooks
- UI: shared components + Radix primitives
- Prefer existing patterns over new parallel architectures

---

# Error Handling Rules

- Normalize AsterMD failures via `AsterMdError` / `normalizeAsterMdError`
- Return user-safe messages from BFF; log codes/status server-side without secrets
- Token failure → do not send authenticated downstream calls (request gate)
- Prefer explicit HTTP status mapping (400/401/404/503) over opaque 500s when known

---

# API Integration Rules

1. Add paths to `endpoints.ts` when wiring real URLs.
2. Use `asterMdFetch` for authenticated calls (inherits token gate).
3. Cache **only** channel detail unless product owners explicitly expand caching.
4. Session create/view are not channel-cached.
5. Forward visitor IP only from trusted proxy headers on the server.
6. Do not hardcode bearer tokens in source, docs, or commits.

---

# Testing Rules

- Prefer synthetic fixtures; never real patient/payment data
- Label bypasses **QA-ONLY**
- After changes: note files touched, behavior change, what was tested, remaining gaps
- Run `npm run typecheck` / `lint` when touching TypeScript meaningfully

---

# Known Gaps / Open Questions

1. AsterMD cart create/update tied to sales session — GAP  
2. Checkout + payment + verified external order ID — GAP  
3. Verification provider configuration — GAP/PENDING  
4. Teleform schema fetch → render → submit — PENDING  
5. Opportunity create/update timing — PENDING  
6. Treatment Sync / Doctor Sync triggers (initial + renewal) — PENDING  
7. Recurring billing owner and whether each renewal creates a new external order — PENDING  
8. Exact AsterMD session expiry/resume — PENDING  
9. Real patient authentication replacing mock patient id — GAP  
10. CDN product images may be AccessDenied; UI uses placeholder fallback — CURRENT mitigation only  

---

# Rules for Future AI Agents

1. Inspect before editing; change the smallest reasonable surface.  
2. Do not rewrite unrelated working code.  
3. Never read or expose secret values; never put secrets in `NEXT_PUBLIC_*`.  
4. Never log access tokens, PHI, PII, payment data, or full sensitive payloads.  
5. Do not fabricate AsterMD API behavior; mark uncertainty PENDING.  
6. Preserve server/BFF security boundaries.  
7. Prefer typed interfaces for external payloads.  
8. Handle external failures without breaking unrelated storefront UI when possible.  
9. Avoid unnecessary duplicate AsterMD sessions — reuse valid cookie/session.  
10. Do not create fake production verification data; use synthetic/test data.  
11. Treat QA bypasses as QA-ONLY.  
12. Before changing checkout/payment/clinical flow, identify downstream effects (opportunity, sync, refill).  
13. Do not assume every doctor network supports every AsterMD feature.  
14. Never infer architecture from UI labels alone.  
15. Do not change CURRENT architecture based solely on LEGACY redirect shells.  
16. Do not invent a monthly subscription AsterMD billing API.  
17. Channel response caching is special-cased — do not copy that pattern to session/cart/payment by default.  
18. After any implementation task, report: files changed, behavior changed, tests performed, unresolved gaps.  
19. Keep the `<!-- BEGIN:nextjs-agent-rules -->` block intact (regenerated by `next dev`).  
20. This is a company/client project — confidentiality first.  
