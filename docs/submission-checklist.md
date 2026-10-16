# Backend submission checklist

Reviewed October 16, 2026 (Europe/Berlin) against the supplied
End-of-Module Backend Project brief. Author: I-Chieh Liu, individual project.
Deadline: October 19, 2026, 23:59 Europe/Berlin.

## Deliverables

| Requirement | Evidence or action | Status |
| --- | --- | --- |
| Meaningful domain and users | README: parents discovering playgrounds and writing reviews | Documented |
| Two related entities and ERD | Playground and Review models; diagram in README and api-plan.md | Implemented/documented |
| API plan and technology rationale | docs/api-plan.md; historical sketch retained as historical | Present; examples updated locally |
| Persistent storage | MongoDB Atlas; Oct 15 live creation, refresh retrieval and retrieval after Render redeployment | Verified in the stated workflow |
| Core CRUD and filters | Playground CRUD, nested review creation/reads, review PATCH/DELETE; location/age/tags filters | Implemented; not every endpoint rechecked live Oct 16 |
| Authentication and ownership | Clerk, requireLogin, ownerId/authorId checks | Automated tests and selected live checks |
| Related-data deletion protection | Owner DELETE with reviews returns 409 | Deployed af86219; user reported 409 and both records retained |
| Body validation | Zod schemas, string trimming, unknown-field stripping | Implemented/tested |
| Query validation | Zod checks scalar filters, lengths and tag counts; location regex symbols are escaped | Deployed e2cb200; selected live GET checks passed Oct 16 |
| CORS, headers, rate limit | app.js: configured origins, Helmet, global 100 requests/15 minutes | Implemented; deployment proxy/IP behavior needs review |
| Safe errors | JSON 400/401/403/404/409/429/500; generic unexpected errors | Tests and selected live evidence |
| Automated tests | 42 backend tests and 64 frontend tests passed Oct 16 | Backend models and Clerk mocked; frontend service tests need an API |
| Setup and configuration | README plus frontend/.env.example and backend/.env.example | Committed and pushed in e2cb200 |
| Independent installation | Clean copy of a861ef4 installed; tests and frontend build passed | Existing local API supplied frontend service-test data |
| Backend URL and HTTPS | https://spielspot.onrender.com/health returned 200 Oct 16 | API process check, not full DB health |
| GitHub repository access | Anonymous page request to https://github.com/i-chieh-liu-88/SpielSpot-v2 returned 200 Oct 16 | Accessible; e2cb200 pushed |
| Contributor names | README identifies I-Chieh Liu; user confirmed individual project | Committed in e2cb200 |
| Daily Slack DMs | Brief requires daily messages, including weekends | User must confirm sent-message history; drafts are not proof of delivery |
| Share final links with instructor | Repository and deployed backend URLs | Pending user submission; no Slack sent by this maintenance |

## Remaining limits to explain

- Clerk still uses a development instance. Production-domain and key setup is
  separate from successful authentication tests on the deployed API.
- The review-existence check and playground deletion are not atomic.
  Concurrent review creation may leave an orphaned review.
- The October 16 local changes validate Review ratings as strings 1 to 5 on
  POST and PATCH, and validate filter queries. Backend tests passed 76 cases.
  Render deployed e2cb200 and selected live query checks passed. Authenticated
  rating POST/PATCH live checks and production IP/rate-limit review remain pending.
- October 16 npm audit: 19 moderate findings in backend test dependencies,
  zero with --omit=dev. No forced dependency downgrade was applied.
- Photos are local previews; there is no server upload or storage endpoint.
- The successful no-review playground DELETE path has mocked-test coverage.
  The October 15 live checks covered 401, 403 and 409, not successful deletion.

## Final actions

1. Resolve required security gaps or confirm accepted limits with the instructor.
2. Commit and push the reviewed setup/API documentation and environment examples.
   Preserve the existing timetable changes; do not include real credentials.
3. Verify the final GitHub files, backend URL and own understanding of the demo.
4. Share the repository and live backend links through the required submission
   channel, and confirm completion before the deadline.

No final submission, Slack delivery, or production-readiness approval is claimed
by this checklist. Optional visual polish is excluded from this backend review.
