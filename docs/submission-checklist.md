# Final backend submission review

Reviewed October 19, 2026 (Europe/Berlin) against the supplied End-of-Module Backend Project brief. Author: **I-Chieh Liu**, individual project.

**Deadline:** October 19, 2026, 23:59 Europe/Berlin.

## Items to submit

| Brief requirement | Repository evidence | Final status |
| --- | --- | --- |
| GitHub repository link | https://github.com/i-chieh-liu-88/SpielSpot-v2 | Accessible; anonymous HTTP 200 checked October 19 |
| README: purpose and users | README introduction and backend assessment overview | Present |
| README: endpoints and request/response examples | Route table and health/error examples; linked full API examples in docs/api-plan.md | Present |
| Names of all participants | README: I-Chieh Liu, individual project | Present |
| Install, configure, run and test instructions | README; backend/.env.example and frontend/.env.example | Present |
| Project plan and data-model diagram | README links docs/api-plan.md (ERD and API plan) and the English timetable | Present |
| Deployed backend URL in README and submission | https://spielspot.onrender.com/ and /health | README includes both; instructor message still needs sending |
| Daily Slack DM updates | Actual Slack sent-message history | User must confirm; generated drafts are not delivery evidence |

The frontend website link is useful for demonstration. The brief explicitly requires the deployed **backend** link, so include it even when sharing the website.

## Backend evidence

| Requirement | Evidence and scope |
| --- | --- |
| Meaningful domain | Parents finding playgrounds and contributing reviews |
| Two related entities | Playground and Review, with Review.playgroundId referencing the parent; ERD in api-plan.md |
| Persistent storage | MongoDB Atlas; recorded authenticated creation, refresh retrieval and deployed API reads |
| REST operations | Playground CRUD, nested review creation/reads, review PATCH/DELETE and location/age/tag filters |
| Authentication and authorization | Clerk bearer verification and backend owner/author checks; automated tests and selected dated live checks |
| Input validation | Zod body/query schemas, trimming, unknown-field stripping and escaped literal location searches |
| Security middleware | Deliberate CORS, Helmet, rate limiting, generic server errors and HTTPS |
| Proxy setting | Three-hop Render path checked with normal and forged-prefix headers; diagnostics disabled; direct localhost uses zero |
| Relationship integrity | Review creation/deletion transactions deployed; both race orders and rollback checked in an isolated Atlas database |
| Photos | Owner-only Cloudinary uploads; server-side validation, resizing, metadata removal and durable cleanup retries |
| Automated verification | Latest recorded checks: 120 backend tests, 80 frontend tests, lint and production build passed |
| Deployed backend | Render deployed 5cf229f; health and public playground-list requests returned 200 on October 19 |
| Cloud cleanup | Deployed worker removed two replaced assets and the remaining test asset; authorized test record absent and zero related queued jobs remained |
| Credentials/build output | Tracked-path review found only environment templates/type declarations for env matches, and no tracked node_modules or dist files. This is not a full secret-history audit. |

## Limits to disclose

- Clerk uses development keys. Production-instance setup remains deferred until a suitable owned domain is available. The brief asks for secure production deployment; acceptance of this remaining limit is for the instructor to assess.
- Netlify skipped the newest frontend release because production deployment credits are exhausted. The public frontend remains on 6587704; the latest owner editor works in the tested local build. The backend release is live. Frontend deployment is not a separate item in this backend brief.
- MongoDB and Cloudinary do not share a transaction. Persisted cleanup jobs allow retries, but persistent provider failures need investigation and older untracked orphans remain outside the mechanism.
- The controlled concurrency checks were database/service tests, not a simultaneous authenticated production HTTP test.
- Deployed album replacement used the new local frontend and an authenticated, test-record-restricted proxy to Render. Final test-record deletion used the database/service transaction path, not a new live HTTP DELETE request. Successful no-review DELETE still has automated controller/route coverage; do not describe that specific live HTTP path as newly verified.
- Proxy checks support the tested connection. Live multi-client/IPv6 rate-limit isolation remains unverified.
- The build still reports a large-bundle warning. The earlier backend audit reported moderate findings in test dependencies; this review did not rerun the dependency audit or establish full production readiness.

Detailed release evidence: [photo cleanup](photo-cleanup.md), [backend handoff](backend-handoff.md), [API plan and examples](api-plan.md).

## Submission message checklist

- Include the GitHub repository and deployed backend URL.
- Optionally add the frontend website and health-check URL.
- State that setup instructions, API documentation, test results and known limitations are in the repository.
- Mention that the backend is live while the latest frontend release is blocked by Netlify credits.
- Send the message to Aretas via Slack DM before the deadline and check that it appears in sent history.
- Confirm the earlier daily updates in Slack. The brief says EVERYDAY, with no weekend exception; this chat's weekday automation alone does not prove that requirement is met.

No Slack message has been sent by this review. Instructor receipt, acceptance of known limitations, and the participant's ability to explain the submitted work remain outside this verification.
