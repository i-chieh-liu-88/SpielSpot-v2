# Playground editing and photo cleanup

Implementation date: October 19, 2026. Local implementation, signed-in editing and cloud integration checks are complete. Deployment remains pending.

## Editing

Owners can submit the edit form through `PATCH /api/playgrounds/:id`. The form validates input, disables repeated submission while saving, retains input after errors and shows a success message. Backend ownership checks remain mandatory.

Selecting no new photos keeps the existing album. Selecting photos replaces the whole album, with a maximum of five. Details save before photo upload. After a photo error, retry uploads without repeating the details PATCH, or continue to the saved listing. A lost response can leave the photo result uncertain; reload the listing to check it.

## Durable cleanup

MongoDB and Cloudinary still do not share a transaction. The new `photocleanups` collection records work that the server can retry:

1. Before upload, reserve unique Cloudinary public IDs in MongoDB with a 30-minute recovery deadline. This also covers lost provider responses and process crashes.
2. Save the album, consume its reservations and queue the previous assets in one MongoDB transaction. If queue insertion fails, the album replacement rolls back.
3. Queue assets and delete a playground in one transaction. The existing review protection still runs first.
4. On startup and every minute while the server runs, process up to ten due jobs. Each job receives a five-minute lease. Check current playground references before deleting an asset.
5. Remove a job only after Cloudinary confirms `ok` or `not found`. Keep jobs for referenced assets and failed removals for a later retry. An expired or claimed upload reservation cannot be adopted by an album save.

Never reuse a public ID for a new upload. Never remove queue documents merely to clear an error. No TTL index deletes failed jobs.

The worker needs a running server and working MongoDB/Cloudinary credentials. Render suspension pauses processing; startup resumes it. Persistent provider failures leave durable jobs that require investigation. This mechanism covers newly tracked operations, not orphan assets from older releases. CDN invalidation may take time even after Cloudinary confirms deletion.

## Verification

- Automated tests cover edit PATCH, retained input, photo-only retries, owner/sign-in gates, success messages, durable reservations, queue failures, retained cleanup retries and referenced-asset protection.
- `backend/scripts/verify-photo-cleanup.mjs` checks replacement cleanup, deletion cleanup and transaction rollback using a fresh Atlas database and generated Cloudinary images. It passed on October 19; both images and the temporary database were removed.
- The first two integration attempts failed an assertion because the Cloudinary Admin SDK nests the error status under `error.http_code`. Correcting the assertion confirmed that the assets were absent. Each attempt cleaned its own assets and database.
- These are local code checks against real cloud services. They do not claim that the new worker is deployed or that the signed-in live HTTP flow has passed.

To repeat the isolated cloud test, explicitly set `ALLOW_TEMP_PHOTO_TEST=true` and run `node backend/scripts/verify-photo-cleanup.mjs` from the repository root. It reads `backend/.env`, uploads two generated images, uses only a random `sp_photo_test_` database and removes its test resources. If cleanup fails, retain the test database for recovery; inspect it before taking further action.

## Local browser checks

On October 19, the signed-in owner saved a temporary name change to existing test record `6acf3d950376e912e6416b79` through localhost:5174. The success message appeared and the updated name remained after refreshing the detail page. Production preview on localhost:4173 loaded the edited data and saved the original name again. No photos were changed on this record.

Latest checks: 120 backend tests, 80 frontend tests, lint and production build passed. The existing bundle-size warning remains. New photo replacement/cleanup was verified through the isolated cloud integration script, not the deployed browser flow.

## Release checks

- Deploy the backend first so the cleanup collection and worker initialize.
- Deploy the frontend and verify an owner edit, refresh persistence and photo replacement using a designated disposable test listing.
- Verify deletion cleanup only on that disposable listing with no reviews. Confirm removal through Cloudinary and the cleanup queue, not only a cached image URL.
- Do not describe these release checks as complete until they have been performed.
