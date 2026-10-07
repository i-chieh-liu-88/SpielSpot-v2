# SpielSpot-v2 Backend

Backend API for the SpielSpot playground discovery platform. The frontend reuses the existing SpielSpot project under `frontend/`, and this backend provides CRUD APIs for two related entities, Playground and Review, with Clerk authentication.

**Live backend URL:** https://spielspot.onrender.com

Full API plan and ERD: [`docs/api-plan.md`](./docs/api-plan.md). Development log: [`docs/day1-log.md`](./docs/day1-log.md) and [`docs/day2-log.md`](./docs/day2-log.md).

## Tech Stack

- Node.js + Express
- MongoDB Atlas + Mongoose
- Clerk (JWT authentication)
- Zod (input validation)
- helmet / cors / express-rate-limit (security middleware)

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file in the `backend/` root:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/spielspot?retryWrites=true&w=majority
PORT=5000
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

- `MONGODB_URI`: MongoDB Atlas connection string
- `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY`: must belong to the same Clerk application as the frontend's `VITE_CLERK_PUBLISHABLE_KEY`

## Running the Server

```bash
npm start
```

A successful start prints:

```
MongoDB connected
Server running on port 5000
```

## API Endpoints

| Method | Endpoint                     | Description                                         | Auth            |
| ------ | ---------------------------- | --------------------------------------------------- | --------------- |
| GET    | /api/playgrounds             | Get all playgrounds (supports filtering, see below) | No              |
| GET    | /api/playgrounds/:id         | Get a single playground                             | No              |
| POST   | /api/playgrounds             | Create a playground                                 | Yes             |
| PATCH  | /api/playgrounds/:id         | Update (owner only)                                 | Yes + ownership |
| DELETE | /api/playgrounds/:id         | Delete (owner only)                                 | Yes + ownership |
| GET    | /api/playgrounds/:id/reviews | Get all reviews for a playground                    | No              |
| POST   | /api/playgrounds/:id/reviews | Create a review                                     | Yes             |
| PATCH  | /api/reviews/:id             | Update own review                                   | Yes + ownership |
| DELETE | /api/reviews/:id             | Delete own review                                   | Yes + ownership |

### Filtering GET /api/playgrounds

All query parameters are optional and can be combined:

| Param      | Example                 | Behavior                       |
| ---------- | ----------------------- | ------------------------------ |
| `location` | `?location=Essen`       | Case-insensitive partial match |
| `ageRange` | `?ageRange=3-8`         | Exact match                    |
| `tags`     | `?tags=outdoor,sandbox` | Matches any of the listed tags |

Full request/response formats, example error responses, and the ERD are in [`docs/api-plan.md`](./docs/api-plan.md).

## Security

- Clerk JWT authentication (`requireLogin` middleware)
- Ownership checks: only the resource owner can PATCH/DELETE
- Input validation with Zod
- `helmet`, `cors` (whitelisted frontend origin), `express-rate-limit`
- Centralized error handler that never leaks internal stack traces
- Secrets stored in `.env`, excluded via `.gitignore`

## Testing

```bash
npm test
```

33 automated tests (Jest unit tests + Supertest integration tests), covering success cases, validation errors, authentication, and ownership checks.

## Current Status

- Done: Playground/Review full CRUD, Clerk auth, ownership checks, security middleware, input validation, filtering, and automated tests are implemented and passing
- Done: frontend (Netlify) is connected to the live backend; deployed and verified end to end
- To verify: the review editing endpoint and playground filters were added and tested locally on 06.10; live verification on Render is today's task (see `docs/day2-log.md` for the running history of what's been checked where)
