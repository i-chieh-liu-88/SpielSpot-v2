# Project rules

- Keep frontend code in frontend/ and future server code in backend/.
- Preserve the UI and routes; reuse the Atomic Design component folders.
- Do not edit frontend/src/routeTree.gen.ts manually; Vite generates it.
- Do not commit credentials, environment files, dependencies or build output.
- Keep Clerk authentication. Data currently uses fixtures and writes are disabled.
  Do not claim persistence exists until the new backend implements it.
- Install with npm --prefix frontend install. Run npm run lint, npm test and
  npm run build from this directory after changes. Check affected browser flows
  with npm run dev, then production with npm run preview.
- Keep frontend/package-lock.json synchronized with frontend/package.json.
- Update README.md and docs/backend-handoff.md when integration changes.
