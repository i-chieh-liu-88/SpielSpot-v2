<!-- -------------------- 用來記錄前端和後端如何串接、目前做到哪裡，以及還有哪些限制 -------------------- -->
<!-- -------------------- 用來記錄前端和後端如何串接、目前做到哪裡，以及還有哪些限制 -------------------- -->
<!-- -------------------- 用來記錄前端和後端如何串接、目前做到哪裡，以及還有哪些限制 -------------------- -->

# Frontend integration boundary

## October 19 final verification

- Backend: 89 mocked tests passed. Frontend: 74 tests passed; service tests now mock HTTP responses instead of consuming the real API rate limit.
- Simultaneous list requests share an in-flight promise; results are cloned per caller. Completed requests are not cached, and a failed request can be retried.
- After the existing local rate-limit window expired, Berlin filtering returned one result with a working map; Reset restored paginated results. No rate-limit protection was disabled.
- Latest map controls enable wheel zoom, keep explicit Search this area, and show a brand-styled details link. Initial fitBounds caps zoom at 15 for single/identical coordinates.
- Multi-photo backend/frontend deployment and live verification completed October 18. These observations supersede older preview-only and local-only photo notes below.
- Current frontend deployment and final submission receipt require separate confirmation. Historical verification records below remain dated evidence.


## Input validation update (deployed October 16)

- Playground GET filters accept only known keys with single string values.
  After trimming: location is at most 200 characters, ageRange 80, and tags
  1000 total with at most 10 nonempty tags of 80 characters each. Empty filters
  restore the full list. Location search treats regex syntax as literal text.
- Review POST and PATCH accept safetyRating and overallRating only as strings
  1 to 5 after trimming. Numeric JSON values and fractions return 400. PATCH
  does not require omitted ratings, so text-only edits remain supported.
- All 76 backend tests passed, including invalid queries rejected before model
  access, literal search, boundary values, rating failures and successful writes.
  These are mocked API tests. Render deployed `e2cb200`; live health returned
  200, ordinary filters and literal regex-symbol searches returned 200, and
  duplicate/oversized location queries returned 400. The live frontend filtered
  Dresden to 6 records and Reset restored 8. Authenticated rating POST/PATCH
  live checks remain pending. No data was modified by these GET checks.

## Setup and verification review (October 16)

- A clean temporary copy of committed source `a861ef4`, without local secrets
  or existing node_modules, installed both dependency sets. Parsed frontend and
  backend lockfiles remained identical to the repository versions. Backend 42
  tests, frontend 64 tests and production build passed in that copy. Frontend
  service tests used the already-running local API; a fresh Atlas/Clerk setup
  was not tested. The working checkout also passed lint and 64 frontend tests.
- On Windows, use the full folder path when running Vite. The temporary
  `DCI-ST~1` alias caused build and setup-file resolution errors; rerunning from
  the canonical full path passed. The existing chunk-size warning remains.
- Use Node.js 22.12 or newer. From the repository root, install with
  `npm --prefix frontend install` and `npm --prefix backend install`.
- Copy each folder's `.env.example` to its local environment file and supply
  your own values. Frontend variables are public; never put a Clerk secret key
  or MongoDB URI there. README lists start and verification commands.
- Backend route tests mock Clerk and database models. Frontend playground
  service tests require a running, populated API; the full suite is not offline.
- October 16 npm audit reported 19 moderate findings in the backend Jest dev
  dependency tree and zero with `--omit=dev`. No forced upgrade was applied.
- Clerk still uses development keys. Review creation and playground deletion
  still have a concurrency gap; the related-data check is not a transaction.

## Playground deletion policy (deployed October 15)

- A signed-in owner can delete a playground only when no reviews reference it.
- Related reviews cause `409` with `Cannot delete a playground with reviews`.
  No playground or review is deleted in this case. A review lookup failure
  returns the shared server error and prevents deletion.
- Permission checks run before the related-review lookup. Request-body
  `ownerId` cannot grant deletion permission.
- Local mocked route tests cover owner success, signed-out 401, non-owner and
  spoofed-owner 403, missing playground 404, related-review 409 and lookup failure.
  Render deployed `af86219` on October 15. Assistant live checks confirmed
  health/read 200 and signed-out DELETE 401. The user reported owner DELETE 409,
  confirmed both records remained, and reported non-owner DELETE 403.
  The lookup and deletion are separate operations, so concurrent review creation
  remains a gap. A successful deletion with no reviews has mocked-test coverage;
  it has not been verified on live data in the October 15 checks.

## Local browsing UI update (2026-10-14)

- Desktop results use a vertical list with a sticky map alongside it. Smaller
  screens start in List view and offer a Map view. The map mounts only when
  visible, avoiding invalid Leaflet dimensions in a hidden panel.
- Address lookup and device location move the map. The separate, collapsible
  filter form narrows API results. Search and secondary buttons fit their text
  while keeping touch targets at least 44 px high.
- Panning or zooming does not replace the list. Search this area explicitly
  applies visible playground IDs; Show all matching results clears that area.
  Applying or resetting API filters also clears the area selection.
- Selecting a map pin shows a summary and detail link instead of navigating
  immediately. Mouse-wheel zoom is disabled; zoom buttons remain available.
- Local development checks confirmed page scrolling over the map without zoom,
  mobile switching, and results changing from 7 to 5 only after area search.
  Production preview confirmed Dresden filtering (5 results), Reset (7 results),
  mobile switching and no horizontal overflow at 390 px. This is browser viewport
  testing, not a physical touch-device or complete screen-reader audit.
- Lint, all 64 frontend tests across 21 files, and build passed. The existing
  chunk-size warning remains. The functional browsing and form updates reached
  the live frontend on October 15.

Playground services now call the backend API. Clerk authentication is retained.
Old Supabase configuration, migrations and live data are not included.

Netlify serves the frontend from `frontend/dist`. Vite copies
`frontend/public/_redirects` into that directory; its SPA rewrite lets a direct
visit or refresh of `/playgrounds/:id` load the client-side route.

## Reads

- `frontend/src/services/playgrounds.ts` exposes `getPlaygrounds(filters)` and
  `getPlayground(id)`. Filters accept `location`, `ageRange` and a `tags` array.
  The service encodes query parameters; the API applies the filters.
- UI models are in `frontend/src/types/content.ts`. Playground details and
  reviews come from the backend API. Unknown playground IDs return `null`.
  Landing-page testimonials in `homeContent.ts` remain sample content.
- `frontend/src/services/instruments.ts` preserves an existing sample route;
  instruments are not a playground product requirement.

## Writes and accounts

- Configure Clerk with `frontend/.env.local` using the example file. No secret
  keys belong in Vite environment variables. Configure allowed origins in Clerk
  for the eventual deployment domain.
- Add/edit pages retain sign-in and ownership UI checks. These are not server
  authorization. The backend verifies Clerk tokens and enforces ownership.
- The local Add playground form uses `createPlayground(input, token)` and
  `CreatePlaygroundInput` in `services/playgrounds.ts`. It posts validated details
  to `/api/playgrounds`; latitude, longitude and safety rating are numbers.
  The backend assigns `ownerId`. Photos are local previews and are not sent.
  Playground edit-mode saving remains disabled. Live creation, detail navigation
  and refresh retrieval passed on October 15; the test record remained readable
  after the backend redeployment.
- Review pages allow submission. The review service posts to
  `/api/playgrounds/:id/reviews` with a Clerk bearer token. Open the form from a
  playground detail page to supply its ID. Missing IDs or tokens prevent saving;
  API errors stay visible in the form. A live submission and refresh check
  confirmed the review remained visible on October 5.
- Review authors can edit their review text and overall rating from the
  playground detail page. The frontend sends `PATCH /api/reviews/:id` with a
  Clerk bearer token. The backend checks authorship. Cancel sends no request;
  failed saves keep the form input. Local development and production preview
  checks confirmed saved changes remain after refresh. Live review editing and
  filtering checks were reported on October 13.
- Photo upload is deferred until after submission. The local preview accepts
  JPEG, PNG and WebP up to 5 MB; this does not provide server upload validation.
  Future uploads need server validation, ownership checks, storage and cleanup.

## Preview behavior

Lists, filtering, maps, carousel, details, language and theme remain available.
Sample records have no Clerk owner IDs, so they cannot be edited through the
ownership-gated edit page. The local Add form saves details after sign-in;
edit-mode saving remains disabled. Review submission uses the backend as described above.
Map tiles, address lookup, fonts and Clerk still need internet.

## Live review persistence check (2026-10-05)

- Frontend: https://spielspot.netlify.app
- Backend: https://spielspot.onrender.com
- Playground ID: 6ab30f098ae8fbfd4d48c945
- Submitted a review named `TEST - persistence` through the live website.
- Refreshed the playground detail page and confirmed the review remained visible.
- Result: review submission and retrieval after a page refresh passed.
- This check does not verify persistence across a backend restart or redeployment.

## Local API checks (2026-10-08)

- `GET /health` returns `200` with `{ "success": true, "status": "ok" }`. It confirms the API responds, but does not check MongoDB.
- Unknown routes return JSON with `404`. Malformed JSON returns `400`.
- Unexpected database errors return a generic `500` response without exposing internal error details.
- Local CORS checks allowed `http://localhost:5173` and `http://localhost:4173`. The production frontend origin still comes from `CLIENT_URL`.
- Local rate limiting returned `429` after 100 requests within the configured window.
- Backend tests: 37 passed. Frontend tests: 49 passed. Lint and build passed.
- The playground list, detail page, and detail-page refresh worked in development and production preview.
- These were local checks on October 8. The Render checks are recorded below.

## Render verification (2026-10-09)

- Commit `57171d9` was live on Render.
- `GET /health` returned the expected OK response.
- An unknown API route returned a JSON error.
- Malformed JSON returned `400` with `Invalid JSON format`.
- `GET /api/playgrounds` returned playground data.
- The deployed frontend loaded the playground list, detail page, and reviews.

## Local frontend checks (2026-10-12)

- Review Save now closes the edit form, refreshes the data and shows a success
  message without a full-page reload. Opening Edit clears the old success message.
- Missing tokens show a sign-in instruction. Failed network requests show a
  connection message and preserve the draft.
- The filter form uses age ranges and tags from the unfiltered API data. Apply
  sends the selected conditions; Reset clears them. Show all also clears the
  URL keyword search and resets the form.
- Each Apply or Reset starts a new request, including repeated conditions.
  Loading, request errors and empty results have separate display states.
- The user confirmed development checks for keyboard use, 390 px mobile layout,
  failed requests with retained input and recovery with the same conditions.
- Assistant checks on localhost:4173 confirmed review save feedback, clearing
  the notice on Edit, Dresden filtering (3 results), age 3-8 with outdoor
  filtering (2 results), and empty results followed by Show all (5 results).
  The review save check used an existing test review with unchanged text/rating.
- Lint, all 52 frontend tests across 20 files, and the production build passed.
  The build still reports the existing warning for chunks larger than 500 kB.
- These checks were local on October 12. Live checks were reported on October 13.

## Local playground creation checks (2026-10-14)

- The form obtains a Clerk token, sends validated details and prevents concurrent
  submissions. Missing tokens show a sign-in instruction. Failed saves keep input
  and restore the submit button. Success uses the existing detail or review
  navigation callback; manual checks covered the detail-page path.
- Assistant browser checks created `TEST Oct 14 Create Flow`
  (`6acf3d950376e912e6416b79`) in development and `TEST Preview Oct 14`
  (`6acf468d1cffacd465453076`) on localhost:4173. Both opened detail pages.
  The user confirmed the development refresh; the assistant confirmed the
  production preview refresh. These test records remain in the connected database.
- With the local backend stopped, saving showed an error, preserved the fields
  and selected tag, and restored the button. The backend was restarted and
  `/health` returned OK. This failed attempt did not create a record.
- Four form tests cover disabled edit saving, successful creation with a token,
  input retention after failure, and duplicate-submission prevention.
- Lint passed. The user reported 55 frontend tests passing across 20 files and
  a successful build with the existing chunk-size warning. After the banner and
  translation edits, the user confirmed both languages in development and the
  assistant reran the production build successfully.
- The global banner now states that photos are preview only. The creation form
  update has not been deployed or verified on the live frontend. Photo upload,
  playground edit saving and backend restart persistence are not verified here.

## October 16 photo upload update (local, not deployed)

The creation form now supports one optional Cloudinary photo. This supersedes
older preview-only notes for local creation. General edit saving is still disabled.

Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET privately
in backend/.env and restart the backend. Never put the API secret in frontend
variables or Git. Set these same variables privately on Render before deployment.

POST /api/playgrounds/:id/photo accepts multipart form data with one photo field.
Clerk authentication and ownership checks run before file processing. Only JPEG,
PNG and WebP up to 5 MB and 25 megapixels are accepted. The backend decodes the
bytes, removes metadata and converts the image to WebP within 1600 by 1600 pixels.
MongoDB stores imageUrl and a hidden imagePublicId. Uploaded images are public.
Only upload photos that may be shared publicly.

The frontend first creates the details, then uploads the photo. If photo upload
fails, it retains the created ID and retries without another creation request.
Details stay locked after creation; users may continue without the photo.
Replacement and deletion attempt cloud cleanup. Cleanup failures log a generic
warning and can leave unused assets requiring manual cleanup. Cloud and MongoDB
operations do not share a transaction. An ambiguous network failure during
creation still needs manual checking before retrying.

Responses: 400 invalid file or ID, 401 signed out, 403 not the owner, 404 missing
playground, 409 playground changed during upload, 502 provider failure, 503 missing
storage configuration, 500 database failure. Database save failures trigger an
attempt to remove the newly uploaded asset.

Verified locally: 84 backend tests, 67 frontend tests, lint and production build.
A generated Cloudinary image uploaded and was deleted successfully. Production preview file selection showed the selected image. Signed-in creation and refresh retrieval passed on localhost:5173 for test record 6ad1f17fc2be5443c729bf3d. The same photo loaded in localhost:4173 production preview. Live deployment checks remain pending.

### October 16 live photo verification

The photo feature is deployed: Render runs 8639af1 and the Netlify frontend
includes the photo flow and upload error reasons. Initial live uploads failed
with Cloudinary signature rejection (provider 401, API 502). After the user
corrected Render credentials and redeployed, retrying the existing saved record
succeeded without creating another playground.

Verified on https://spielspot.netlify.app/playgrounds/6ad212c1ab82eabf8524899b:
the Cloudinary image loaded before and after browser refresh. The record is
named TEST Oct 16 Photo Credentials Retest. Its green image is generated test
data, not a real playground photo. The test record remains in the database.
This supersedes the pending live deployment status in the local photo update.
Live image replacement and photo cleanup on playground deletion are not yet
verified; their implementation and automated checks are separate evidence.

### Five-photo album extension (local, not deployed)

Creation now accepts up to five JPEG, PNG or WebP photos, each up to 5 MB and
25 megapixels. The first selected photo is the cover. Users can remove selected
photos before submission; removing the cover promotes the next photo. Detail
pages provide labeled thumbnail buttons and a photo counter. Existing imageUrl
records remain readable without migration. Edit mode still cannot save changes,
but continues showing existing photos.

POST /api/playgrounds/:id/photos accepts repeated multipart photos fields and
replaces the complete album. The previous singular photo endpoint remains
available and replaces the album with one photo. The server validates all files
before cloud uploads, processes them sequentially, and updates MongoDB only when
all uploads succeed. A failed batch attempts cleanup of every newly uploaded
asset and leaves the old album intact. Retries reuse the created playground ID.
A photoRevision compare-and-update rejects stale concurrent album saves with
409 and attempts cleanup of the losing upload. This protects album replacement;
it does not change the deferred review creation/deletion concurrency limitation.

imageUrls stores ordered display URLs. imagePublicIds is hidden from normal
queries and used for replacement/deletion cleanup. Legacy imageUrl and hidden
imagePublicId retain the cover for compatibility. Cleanup failures log a fixed
warning and may leave unused cloud assets requiring manual cleanup.

Backend tests: 89 passed, including five-photo order, a sixth-file rejection,
whole-batch validation, partial cloud failure cleanup, and stale revision handling.
Full authenticated multi-photo browser saving and live deployment remain pending.

### Five-photo local browser verification

On October 16, authenticated creation on localhost:5174 uploaded three generated
images to Cloudinary and saved their ordered URLs in MongoDB for test record
6ad2262eaf1dc0fc668ad088 (TEST Oct 16 Multi Photo Album). Switching to photo 3
worked; browser refresh retained all three photos. Production preview on
localhost:4173 switched to photos 2 and 3. At 390px width there was no horizontal
page overflow. The three solid-color images are synthetic test assets and the
record remains in the database. Existing single-photo records still load.

Final checks: 70 frontend tests, 89 backend tests, lint and build passed. The
existing bundle-size warning remains. The gallery extension passed scoped code
and screenshot review. Live multi-photo deployment is still pending; this
supersedes the pending local browser verification above, not the live status.
For the localhost:5174 test, the backend process was started with CLIENT_URL set
to http://localhost:5174. A backend restart must retain that setting when using
this port; the standard development fallback origins remain 5173 and 4173.

### October 18 multi-photo deployment

Deployment checks passed: frontend lint, 70 frontend tests, production build,
and 89 backend tests. The existing large-bundle warning remains. Render deployed
b03b0dd (five-photo API) before the frontend release. A signed-out request to the
live /photos endpoint returned 401 instead of the previous 404. Frontend commit
a864acc was pushed, and the Netlify production site displayed the new multi-photo
form and gallery. Local and deployed entry hashes differ because build environment
values differ; the live form and gallery behavior were checked in the browser.

The assistant opened existing test record 6ad2262eaf1dc0fc668ad088 on the live
website, switched to photo 3, confirmed the Cloudinary image loaded, and refreshed
the page with all three photos retained. This record was created during the
October 16 local integration test and is not a new production upload test.

A new three-photo live test form, TEST Oct 18 Live Multi Photo Deployment, was
prepared but not submitted: automatic approval review rejected the production
data creation because deployment authorization did not include that new record
and cloud upload. No workaround was attempted. Fresh authenticated live multi-photo
upload remains pending explicit authorization. This supersedes the pending
deployment status above, while retaining that verification gap. Timeline edits
were intentionally excluded from these deployment commits.

### October 18 authorized live multi-photo upload

After explicit user approval, the assistant submitted TEST Oct 18 Live Multi
Photo Deployment with three generated test images through the Netlify production
form. The Render multi-photo API saved the album and the detail page opened at
https://spielspot.netlify.app/playgrounds/6ad4d82fae38d5b10d54471d.
The first photo appeared as the cover. Switching to photo 3 loaded its Cloudinary
image. After browser refresh the gallery retained three photos, and switching
to photo 2 also loaded its image. The test record and images remain.

This completes the fresh authenticated live multi-photo upload check that was
previously pending approval. It does not establish live replacement/deletion
cleanup or concurrent-request behavior, which remain separate verification gaps.
No code changed for this check and no test suite was rerun.

## Final live checks (October 19, 2026)

- Release 6587704 was pushed to main and Netlify showed Published for that commit. The live site displayed the new map guidance.
- Live Berlin filtering returned one result without a map error. Reset restored 14 results, displayed as 10 and 4 across two pages.
- The existing five-photo listing loaded, the fifth photo rendered, and its details/gallery remained available after refresh. These checks did not create or delete data.
- Live API checks: GET /health 200; Berlin list GET 200; duplicate location query 400; unsigned playground POST 401. These checks do not re-establish every authenticated owner/non-owner path. Earlier live ownership checks remain dated evidence.
- Public GitHub returned 200. Final automated checks: 89 backend tests, 74 frontend tests, lint and production build passed. The existing bundle-size warning remains.
- User confirmed that submission only needs the GitHub and website links. Links are ready to hand over; instructor receipt and Slack delivery have not been confirmed.

## Proxy configuration (local implementation, not yet deployed)

TRUST_PROXY_HOPS accepts integers 0-5 and defaults to 0 (no trusted proxy).
Local direct access must keep 0. Do not set true. Configure the actual trusted
hop count only after verifying Render’s forwarding path and that clients cannot
reach Express through a shorter route. A one-hop test is a model, not evidence
that Render uses exactly one hop. Do not trust the leftmost X-Forwarded-For
entry without checking the proxy chain. This setting also affects protocol
and hostname handling. Local tests verify shared-IP rate limiting, separate
visitor buckets and forged prefix handling for the simulated one-hop path.
Keep the 100 requests per 15 minutes policy unchanged. Live topology, IPv6
and spoofed-header verification remain pending before enabling this setting.

Temporary proxy inspection: set PROXY_DIAGNOSTICS_ENABLED=true only during
verification. GET /api/diagnostics/proxy requires a Clerk bearer token and
returns header counts/format booleans only, with no-store. Disabled returns 404.
Counts alone do not establish which hop is the real visitor or prove spoof
resistance. Do not enable TRUST_PROXY_HOPS from counts alone. Turn diagnostics
off after inspection. This diagnostic preparation is local, not deployed.

## Proxy verification completed (October 19, 2026)

- Render deployed 50c40e2. The user reported normal and forged-prefix responses with trustedProxyHops=3 and matchingHopsFromApp=[3]. Adding the prefix increased forwarded entries from 3 to 4 without changing the matching position. This supports the three-hop setting for this tested connection, not every network path.
- The user disabled PROXY_DIAGNOSTICS_ENABLED. Assistant checks then confirmed diagnostic GET 404, health GET 200 and Berlin list GET 200. Keep TRUST_PROXY_HOPS=3 on the verified Render path and 0 on direct localhost.
- Latest backend run: 102 tests passed. Earlier counts are historical. Simulated proxy tests and user-run live checks are separate evidence.
- Recheck after adding a CDN, proxy, private-network caller or shorter route. Live multi-client/IPv6 rate-limit isolation is not fully verified. Clerk production setup and review/delete concurrency remain separate pending work.
- This supersedes earlier local-only proxy notes. Keep diagnostics disabled outside intentional verification.

## Review/delete concurrency change (local, not deployed)

Review creation and playground deletion now use Connection.transaction with
snapshot reads, primary preference and majority commit. Mongoose automatic
transaction sessions are enabled; all database operations run sequentially
inside the callback. Both operations increment the same hidden
relationshipRevision field before checking/inserting/deleting related data.
The parent write forces conflicts to retry against a fresh state. Responses
and Cloudinary cleanup happen after commit, outside the retryable callback.
No fallback to nontransactional writes is allowed if transactions fail.
Existing records acquire the revision field on their first increment.
107 mocked backend tests passed; real concurrency verification remains pending.
The opt-in script backend/scripts/verify-review-concurrency.mjs uses a new
random sp_review_test_ database and removes only that database after
testing both race orders and rollback. It requires ALLOW_TEMP_CONCURRENCY_DB=true
and an Atlas account authorized to create the separate test database.

## Atlas concurrency verification (October 19, 2026)

With explicit user permission, the integration script used a new random
sp_review_test_ database on Atlas. Create-first preserved the parent/review
and rejected deletion with 409; delete-first removed the parent and rejected
review creation with 404. Both outcomes contained no orphan review. An
intentional failure rolled back the inserted review and parent revision.
The temporary database was dropped after checks. These are controlled
database-service checks, not a load test or proof of every failure scenario.
The first attempt used a name longer than the Atlas limit and was rejected;
the shortened-name rerun passed. Existing application data was not changed.
The transaction implementation is locally verified; deployment and live
authenticated write checks must be recorded separately.

## Concurrency deployment (October 19, 2026)

Render deployed 48c1392 (Deploy succeeded / Live; MongoDB connected). This
supersedes the local-only status above. Assistant checks returned health 200,
existing playground/read reviews 200, unsigned review POST 401, and disabled
diagnostics 404. No production data was modified during these smoke checks.
Controlled race orders and rollback passed against the isolated Atlas test
DB before deployment; a new authenticated write/delete race through the live
HTTP API has not been run. Backend 107 tests, frontend 74 tests, lint and build
passed. Clerk production-instance setup remains pending. Cloud asset cleanup
still cannot be atomic with the MongoDB transaction.
