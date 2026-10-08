# Medora Health

Medora Health is a production-oriented Next.js patient experience for convenient online healthcare access. The frontend never talks to AsterMD with secrets from the browser. All provider workflows flow through a Next.js BFF (Server Actions / Route Handlers) into an isolated AsterMD service abstraction.

```
User → Next.js Frontend → Next.js Server Layer / BFF → AsterMD API → Provider Workflow
```

Medora does **not** duplicate AsterMD as a custom healthcare backend. Clinical provider operations remain with AsterMD.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS design tokens
- shadcn-style UI primitives (Radix)
- Lucide icons
- React Hook Form + Zod
- TanStack Query (client server-state where useful)
- Server Components by default

## Folder architecture

```text
src/
  app/
    (marketing)/     # Landing, treatments, how-it-works, FAQ, about
    (auth)/          # Login / register shells
    (patient)/       # Dashboard, intake, appointments, Rx, messages, profile
    api/             # BFF route handlers → AsterMD client
  components/        # ui, layout, shared, forms
  features/          # Feature modules (auth, patient, intake, appointments, …)
  lib/
    api/astermd/     # Integration contract, mock + real services, errors
    validations/
    utils/
    constants/
    security/        # Session/auth placeholders (cookie-ready)
  config/            # Site + metadata
  providers/         # Client providers (React Query)
```

## Install

```bash
npm install
```

## Run

```bash
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Public? | Purpose |
|---|---|---|
| `APP_ENV` | **No** | `dev` \| `prod` — switches which AsterMD credential set is used |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL for metadata/links |
| `ASTERMD_DEV_*` | **No** | Dev base URL, client id, secret, channel id, api key |
| `ASTERMD_PROD_*` | **No** | Prod base URL, client id, secret, channel id, api key |
| `ASTERMD_USE_MOCK` | **No** | `true` uses `MockAsterMdService` |

`APP_ENV=dev` → `ASTERMD_DEV_*`  
`APP_ENV=prod` → `ASTERMD_PROD_*`

### AsterMD auth + channel (server-only)

1. `POST {BASE_URL}/v1/auth/api-credentials/token` with `client_id` + `client_secret`
2. JWT is stored in **server memory state** (`token-store`) — never sent to the browser
3. Authenticated calls attach `Authorization: Bearer <token>`
4. `GET {BASE_URL}/v1/sales/channels/detail/{CHANNEL_ID}` uses env channel id

BFF routes:
- `POST /api/astermd/auth/status` — warm token; returns `{ hasToken, expiresAt }` only
- `GET /api/astermd/channel` — channel detail for the configured channel id

### Global channel state (Zustand)

On app load, `ChannelProvider` calls `/api/astermd/channel` and stores the full
channel `data` object in Zustand (`src/stores/channel-store.ts`).

```tsx
import { useChannel } from "@/hooks/use-channel";

const { channel, products, isReady, refetch } = useChannel();
```

Never expose AsterMD secrets with `NEXT_PUBLIC_*`.

## AsterMD integration architecture

1. UI calls Server Actions or `/api/*` route handlers.
2. Handlers resolve the current patient session server-side.
3. Handlers call `getAsterMdClient()` from `src/lib/api/astermd/client.ts`.
4. Client returns either:
   - `MockAsterMdService` (default for development)
   - `RealAsterMdService` (skeleton for production)

Key files:

- `service.ts` — `AsterMdService` interface (integration contract)
- `mock-service.ts` — in-memory mock implementing the contract
- `real-service.ts` — placeholder HTTP implementation
- `mappers.ts` — wire-format → domain mappers (TODO when docs arrive)
- `endpoints.ts` — **placeholder** paths only (not real AsterMD URLs)
- `errors.ts` — `ApiError` / `AsterMdError` / `normalizeAsterMdError()`

### Where to connect real AsterMD APIs

1. Obtain official AsterMD API documentation.
2. Set `APP_ENV` (`dev` / `prod`) and matching credentials:
   `ASTERMD_DEV_*` or `ASTERMD_PROD_*` (`BASE_URL`, `CLIENT_ID`, `CLIENT_SECRET`, `CHANNEL_ID`).
3. Replace placeholder paths in `endpoints.ts`.
4. Implement request/response mapping in `mappers.ts` + `real-service.ts`.
5. Set `ASTERMD_USE_MOCK=false`.
6. Keep UI unchanged — it already depends on `AsterMdService`.

### How mock services work

`MockAsterMdService` implements the same methods as the real service (`createPatient`, `createIntake`, `getAppointments`, etc.) using in-memory demo data in `mock-data.ts`. Presentation components never import mock JSON directly.

## Patient journey (current)

Landing → Treatments → Register/Sign in → Intake → Submit → Provider review status → Dashboard (appointments, prescriptions, messages, follow-up)

## Security notes

- AsterMD secrets stay server-only (`server-only` modules).
- Inputs validated with Zod on the server.
- Auth is cookie-ready but currently a development placeholder (`src/lib/security/auth.ts`).
- Do not store PHI in `localStorage`.
- This architecture supports safer healthcare patterns; it does **not** by itself make the app HIPAA compliant.

## Deployment considerations

- Deploy on a Node-compatible host (e.g. Vercel).
- Configure server env vars in the host (never bake secrets into the client bundle).
- Keep `ASTERMD_USE_MOCK=false` only after real integration is complete.
- Enable production auth/session cookies before any PHI-bearing environment.

## Future recommendations

- Replace demo auth with real identity + HttpOnly sessions
- Drive intake sections from AsterMD/JSON questionnaire config
- Add audit logging without PHI leakage
- Add E2E tests for intake + dashboard states
- Wire WebSocket/polling for messaging once AsterMD supports it

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```
"# medora" 
