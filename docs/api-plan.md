# SpielSpot Backend API Plan

Mini project planning document. The frontend reuses `frontend/` from `i-chieh-liu-88/SpielSpot-v2`; this document plans an entirely new `backend/`.

## Tech Stack

- Runtime: Node.js + Express
- Database: MongoDB Atlas + Mongoose
- Auth: Clerk (verifies JWTs sent from the frontend)

### Why these choices (Tech Stack Rationale)

- **MongoDB + Mongoose over a relational database**: the two core entities
  (Playground, Review) have a simple one-to-many relationship with no need
  for complex joins or multi-table transactions. Mongoose's schema
  validation plus Zod at the API layer gave enough structure without the
  overhead of migrations during fast iteration.
- **Clerk over a custom auth system**: building and securing password
  storage, session management, and token refresh correctly is a large
  surface area to get right. Clerk handles this, and both frontend and
  backend already shared the same provider, so verifying backend-issued
  JWTs was a natural fit.
- **Zod over express-validator**: schema-first validation reads closer to
  the TypeScript types already used on the frontend, supports `.partial()`
  for PATCH requests out of the box, and gives typed, composable schemas
  instead of per-field middleware chains.
- **Render over Vercel for the backend**: this is a long-running Express
  server with a persistent Mongoose connection, not a stateless function,
  so a traditional always-on host fit better than a serverless platform.

## ERD

> GitHub automatically renders the Mermaid syntax below as a diagram, so no separate image file is needed

```mermaid
erDiagram
  PLAYGROUND ||--o{ REVIEW : has
  PLAYGROUND {
    ObjectId _id PK
    string name
    string description
    string location
    string postcode
    number latitude
    number longitude
    string ageRange
    number safetyRating
    string_array tags
    string ownerId
    date createdAt
    date updatedAt
  }
  REVIEW {
    ObjectId _id PK
    ObjectId playgroundId FK
    string playgroundName
    string location
    string ageGroup
    string_array facilities
    string safetyRating
    string overallRating
    string recommendation
    string review
    string parentName
    string authorId
    date createdAt
    date updatedAt
  }
```

Relationship: `Playground 1 --- N Review` (Review stores `playgroundId` as a foreign key)

## API Endpoints

| Method | Endpoint                     | Description                      | Auth required?  |
| ------ | ---------------------------- | -------------------------------- | --------------- |
| GET    | /api/playgrounds             | Get all playgrounds              | No              |
| GET    | /api/playgrounds/:id         | Get a single playground          | No              |
| POST   | /api/playgrounds             | Create a playground              | Yes             |
| PATCH  | /api/playgrounds/:id         | Update (owner only)              | Yes + ownership |
| DELETE | /api/playgrounds/:id         | Delete (owner only)              | Yes + ownership |
| GET    | /api/playgrounds/:id/reviews | Get all reviews for a playground | No              |
| POST   | /api/playgrounds/:id/reviews | Create a review                  | Yes             |
| PATCH  | /api/reviews/:id             | Edit user's review               | Yes + ownership |
| DELETE | /api/reviews/:id             | Delete own review                | Yes + ownership |

To load a playground with its reviews, request `GET /api/playgrounds/:id` and
`GET /api/playgrounds/:id/reviews` separately. The playground list does not
currently support query filtering.

> Note: `safetyRating` is a Number on Playground but a String on Review,
> matching the frontend's PlaygroundMutationInput vs CreateReviewInput types.

### Response Format

```json
// Success
{ "success": true, "data": { } }
// Failure
{ "success": false, "error": "message" }
```

### Example Error Responses

| Status | Example                                                                                      | When                                  |
| ------ | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| 400    | `{ "success": false, "error": "latitude: Invalid input: expected number, received string" }` | Validation failure (Zod)              |
| 401    | `{ "success": false, "error": "Please login" }`                                              | Missing or invalid auth token         |
| 403    | `{ "success": false, "error": "Not allowed to edit this playground" }`                       | Logged in, but not the resource owner |
| 404    | `{ "success": false, "error": "Playground not found" }`                                      | Resource ID does not exist            |
| 500    | `{ "success": false, "error": "Internal server error" }`                                     | Unexpected server-side error          |

## Security Checklist

- Clerk JWT authentication middleware (`verifyToken`)
- Ownership check (only the owner can edit/delete their own data)
- Input validation (`express-validator` or `zod`, to prevent dirty data / NoSQL injection)
- `helmet` (security headers)
- `cors` (whitelisting only the frontend origin)
- Rate limiting (`express-rate-limit`)
- Secrets stored in environment variables (`.env`, excluded from git)
- File upload validation for type/size (JPEG/PNG/WebP, 5MB limit)
- Centralized error handling middleware, no stack trace leaks

## Two-Day Execution Plan

### Day 1 (Today)

1. Set up the `backend/` folder structure (routes, controllers, models, middleware), install express, mongoose, dotenv, configure the MongoDB Atlas connection, and confirm the server runs
2. Write the Playground and Review Mongoose schemas, with ref relationships and basic validation
3. Write a `verifyToken` middleware to verify Clerk JWTs, complete Playground's GET/POST first, and test with Postman
4. Finalize this document's content and add it to the repo as `docs/api-plan.md`

### Day 2 (Tomorrow, submission deadline Tuesday 22.09.2026)

1. Add PATCH/DELETE for playgrounds and reviews, with ownership checks
2. Add helmet, cors, rate limiting, input validation, and centralized error handling middleware
3. Replace the fixture data in `frontend/src/services/playgrounds.ts` with real fetch calls, and run through a full create/edit/delete flow
4. Make sure the README covers installation/startup instructions, the ERD diagram, and a link to the API documentation, then git push and share the repo link with the instructor
