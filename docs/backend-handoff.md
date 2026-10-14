<!-- -------------------- 用來記錄前端和後端如何串接、目前做到哪裡，以及還有哪些限制 -------------------- -->
<!-- -------------------- 用來記錄前端和後端如何串接、目前做到哪裡，以及還有哪些限制 -------------------- -->
<!-- -------------------- 用來記錄前端和後端如何串接、目前做到哪裡，以及還有哪些限制 -------------------- -->

# Frontend integration boundary

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
  chunk-size warning remains. These browsing and form accessibility updates are
  local and have not been committed or deployed.

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
  Playground edit-mode saving remains disabled. The creation UI is not deployed.
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
