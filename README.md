# SpielSpot

SpielSpot helps parents find playgrounds, compare facilities and age ranges, and share reviews. This individual backend project connects a React frontend to an Express API, MongoDB Atlas, Clerk authentication and Cloudinary photo storage.

**Author:** I-Chieh Liu · **Project:** End-of-Module Backend Project

- **Website:** [spielspot.netlify.app](https://spielspot.netlify.app/)
- **GitHub:** [SpielSpot-v2](https://github.com/i-chieh-liu-88/SpielSpot-v2)
- **API health check:** [spielspot.onrender.com/health](https://spielspot.onrender.com/health)

## Try the project

1. Open the website and choose **Find a Playground**.
2. Search or filter playgrounds, explore the map, and open a listing to view its photos and reviews.
3. Sign in to add a playground with up to five photos or write a review. Review authors can edit their own reviews.

Browsing does not require an account. Writes save real data, so use content you have permission to share.

## Backend assessment overview

| Area | Implementation |
| --- | --- |
| Data model | Two related entities: Playground and Review. Each review belongs to one playground. |
| CRUD API | Create, read, update and delete endpoints for playgrounds and reviews. |
| Authentication | Clerk bearer tokens identify signed-in users. |
| Authorization | The backend checks ownership before updates and deletions and assigns owner IDs from authentication. |
| Validation | Zod validates input, including filter queries and review ratings. Invalid requests return clear errors. |
| Data protection | Deleting a playground with reviews returns `409` and keeps both. MongoDB transactions protect against simultaneous review creation and playground deletion. |
| Photo uploads | Owner-only uploads to Cloudinary, with file validation, image resizing and metadata removal. MongoDB stores image URLs and asset references. |
| Security | Helmet, allowed-origin CORS, rate limiting and a central error handler. Secrets stay on the backend. |
| Deployment | Netlify hosts the frontend; Render hosts the API; MongoDB Atlas stores application data. |

**Latest local update (October 19):** owners can now save playground edits and replace the photo album. Durable photo cleanup retries failed removals. Signed-in local editing and refresh checks passed; these changes still need deployment; see the [implementation and verification notes](docs/photo-cleanup.md).

## How the app works

```text
React frontend (Netlify)
    | Clerk bearer token for authenticated requests
    v
Express API (Render)
    |-- MongoDB Atlas: playgrounds, reviews and photo references
    |-- Cloudinary: public photos
    |-- Clerk: authentication verification
```

The main database relationship is **one Playground to many Reviews**. The [API documentation](docs/api-plan.md) contains the ERD and request/response examples.

**Stack:** React, TypeScript, Vite, TanStack Router and Leaflet on the frontend; Node.js, Express, Mongoose and Zod on the backend.

## Run locally

You need Node.js **22.12 or newer**, npm, a MongoDB Atlas database, a Clerk application and Cloudinary credentials for photo uploads. Use a separate database for local testing. Review creation and playground deletion require MongoDB transaction support, which Atlas provides.

### 1. Install dependencies

From the repository root:

```bash
npm --prefix frontend install
npm --prefix backend install
```

### 2. Configure environment variables

Copy the supplied templates and fill in your own values:

| Template | Local file | Required configuration |
| --- | --- | --- |
| `backend/.env.example` | `backend/.env` | MongoDB URI, Clerk keys, frontend origin and Cloudinary credentials |
| `frontend/.env.example` | `frontend/.env.local` | API base URL and Clerk publishable key |

Use the same Clerk instance on both sides. Keep secret keys out of frontend variables and Git.

The default setup uses the API at `http://localhost:5000` and the frontend at `http://localhost:5173`. If Vite uses another port, update the backend's `CLIENT_URL` and restart it. Keep `TRUST_PROXY_HOPS=0` for direct local access and `PROXY_DIAGNOSTICS_ENABLED=false`.

### 3. Start the app

Run these commands in separate terminals from the repository root:

```bash
# Terminal 1: backend
npm --prefix backend start
```

```bash
# Terminal 2: frontend
npm run dev
```

Open the local URL printed by Vite.

## API routes

| Method | Route | Access |
| --- | --- | --- |
| GET | `/health` | Public; checks the API response, not database health |
| GET | `/api/playgrounds` | Public; supports filters |
| GET | `/api/playgrounds/:id` | Public |
| POST | `/api/playgrounds` | Signed-in user |
| PATCH / DELETE | `/api/playgrounds/:id` | Playground owner |
| POST | `/api/playgrounds/:id/photos` | Playground owner; up to five photos |
| GET | `/api/playgrounds/:id/reviews` | Public |
| POST | `/api/playgrounds/:id/reviews` | Signed-in user |
| PATCH / DELETE | `/api/reviews/:id` | Review author |

The legacy single-photo endpoint, `POST /api/playgrounds/:id/photo`, also remains available. Photo uploads accept JPEG, PNG and WebP files up to 5 MB and 25 megapixels each. The first photo becomes the cover.

## Tests and verification

Run from the repository root:

```bash
npm run lint
npm --prefix backend test -- --runInBand
npm test
npm run build
npm run preview
```

The latest recorded checks on **October 19, 2026** passed: **120 backend tests, 80 frontend tests, lint and production build**. The build still reports a bundle-size warning.

- Automated tests cover API validation, authentication and ownership responses, deletion protection, uploads, proxy handling and frontend behavior. These suites use mocked external services.
- Separate Atlas checks used an isolated temporary database to test both review/delete race orders and rollback. The test database was removed afterward.
- Live checks covered photo upload and photos after refresh, filtering, pagination and API responses. The concurrency fix is deployed; a simultaneous authenticated write/delete test through the live HTTP API has not been run.

See the [submission checklist](docs/submission-checklist.md) and [backend handoff](docs/backend-handoff.md) for dated evidence and verification scope.

## Current limitations

- **Clerk development instance:** the deployed demo still uses development keys. Production setup is deferred until a suitable owned domain is available.
- **Release verification:** the new playground editor and durable photo cleanup are implemented locally. Deployment and live HTTP checks remain pending.
- **Cloud storage cleanup:** MongoDB and Cloudinary do not share a transaction. A durable queue now retries cleanup while the server runs. Persistent provider failures still need investigation; older untracked orphan images are outside this recovery mechanism. Real-cloud replacement/deletion checks passed for isolated test data; deployed HTTP verification remains pending.
- **Proxy configuration:** the deployed three-hop setting was checked for the tested Render connection. Other network paths and live multi-client/IPv6 rate-limit isolation need further verification. Diagnostics are disabled.

## Further documentation

- [API, ERD and examples](docs/api-plan.md)
- [Backend integration and deployment notes](docs/backend-handoff.md)
- [Assessment checklist and verification records](docs/submission-checklist.md)
- [Project timetable](docs/TIMELINE/SpielSpot-v2-timetable-EN.md)
- [Archived README development history](docs/readme-history.md) — dated records with superseded statements; use this README for the current overview.
