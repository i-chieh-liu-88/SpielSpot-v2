# Frontend integration boundary

Playground services now call the backend API. Clerk authentication is retained.
Old Supabase configuration, migrations and live data are not included.

## Reads

- `frontend/src/services/playgrounds.ts` exposes `getPlaygrounds()` and
  `getPlayground(id)`. Keep their async return types when replacing fixtures.
- UI models are in `frontend/src/types/content.ts`. Detail records include
  reviews. Unknown IDs return `null`. The data originates from the original
  frontend's `homeContent.ts` fixtures, not the previous live database.
- `frontend/src/services/instruments.ts` preserves an existing sample route;
  instruments are not a playground product requirement.

## Writes and accounts

- Configure Clerk with `frontend/.env.local` using the example file. No secret
  keys belong in Vite environment variables. Configure allowed origins in Clerk
  for the eventual deployment domain.
- Add/edit pages retain sign-in and ownership UI checks. These are not server
  authorization. The new backend must verify Clerk tokens and enforce ownership.
- Playground forms retain validation and local photo previews, but saving is
  disabled. `PlaygroundMutationInput` documents the future service input.
- Review pages allow submission. The review service posts to
  `/api/playgrounds/:id/reviews` with a Clerk bearer token. Open the form from a
  playground detail page to supply its ID. Missing IDs or tokens prevent saving;
  API errors stay visible in the form. End-to-end persistence has not been
  verified by the change enabling this button.
- Validate input, file type and size on the server. The UI supports JPEG, PNG and
  WebP up to 5 MB. Add ownership-aware storage rules and upload cleanup.
- Choose the API contract before adding endpoints or a base URL configuration.

## Preview behavior

Lists, filtering, maps, carousel, details, language and theme remain available.
Sample records have no Clerk owner IDs, so they cannot be edited through the
ownership-gated edit page. Add forms can be previewed after sign-in. Nothing is
saved by those playground forms. Review submission uses the backend as described above.
Map tiles, address lookup, fonts and Clerk still need internet.
