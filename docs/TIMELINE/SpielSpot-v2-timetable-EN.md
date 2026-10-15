# SpielSpot 2.0 | Rolling work plan

Updated October 15, 2026 (Europe/Berlin), using progress reports through October 14 and the October 15 scope clarification in this chat.
This section is the active schedule. The original plan below is historical reference only.
The original budget is 14 weekdays at 3 hours each (42 planned hours, not actual time spent). Three working days and 9 planned hours remain from October 15. Keep weekends off and the October 19, 23:59 deadline.

## Reported progress

Checkbox review: October 7, using reports through October 6. Checked baseline tasks below reflect reported completion, sometimes earlier than their planned date. Unchecked tasks may be partly complete; they are not necessarily unstarted. A passing test suite does not establish coverage of every planned scenario.

- Sep 30: Backend baseline and review deletion permission tests completed. Frontend test/build failures still need current verification.
- Oct 1: API/ERD checks, backend deployment on Render, and dependency fixes completed.
- Oct 2: Frontend deployed on Netlify; CORS and detail-page refresh fixed; review saving reported successful.
- Oct 5: Review creation tests and missing-playground check added; ownership deletion checks and persistence after page refresh reported.
- Oct 6: Live missing-playground 404 and missing/invalid-token 401 checks completed. Review PATCH and playground filters added; 33 passing Jest tests and documentation updates reported.
- Oct 7: The [daily report](../DAILY%20PROGRESS/2026-10-07-progress.md) records deployment of PATCH and filters, live editing checks (owner 200, signed-out 401, non-owner 403), saved changes after refresh, and filter/empty-result checks. The frontend still has no Edit UI.
- Oct 8: The [daily report](../DAILY%20PROGRESS/2026-10-08-progress.md) records JSON 404/400 errors, local CORS/input/rate-limit checks, shared error handling, 37 passing backend tests, 49 passing frontend tests, lint and build. Commit `57171d9` was deployed to Render. The user confirmed the live `/health` response, unknown-route JSON, malformed-JSON 400, playground API data, and frontend list/detail/review loading. `/health` checks the API process, not database health.
- Oct 9: The [daily report](../DAILY%20PROGRESS/2026-10-09-progress.md) confirms the author-only Edit button, prefilled text/rating form, Cancel and PATCH saving. Saved changes remained after refresh in development and local production preview. Lint, 50 frontend tests and build passed. The user committed this work as `ab53ff0`; frontend deployment remains unconfirmed.
- Oct 12: The [daily report](../DAILY%20PROGRESS/2026-10-12-progress.md) confirms success/sign-in/connection feedback, retained drafts after failed saves, API location/age/tag filters, Reset, loading/error/empty states and retries with unchanged filters. Two filter UI tests were added. Keyboard/mobile checks, lint, all 52 frontend tests and build passed. Assistant checks on localhost:4173 confirmed save feedback and filtering/reset flows. README and handoff notes were updated. These changes are local; the October 12 work still needs commit, push and frontend deployment.

- Oct 13: The [daily report](../DAILY%20PROGRESS/2026-10-13-progress.md) confirms the frontend deployment and live workflows. GitHub main and the Netlify production deployment use commit `460936e`. The user confirmed live Render API reads, review editing/success feedback, Cancel, refresh persistence, filters, Reset and empty-result recovery. Assistant checks confirmed a non-author PATCH returned 403, a PATCH without a token returned 401, and the test review remained unchanged. Online 390 px checks passed for review editing/Cancel, filter layout, filtering and Reset; no physical-device touch test was performed.
- Oct 13 scope decision: the user chose option B. Before submission, connect playground creation and saving to the existing backend. Real photo upload/storage is planned after submission. At that point, photos were local previews and playground saving was not connected. The October 14 update below supersedes the saving status; photo upload remains pending.

- Oct 14 creation: the [daily report](../DAILY%20PROGRESS/2026-10-14-progress.md) confirms Clerk-authenticated playground creation, validation, saving feedback, retained input after failed requests and duplicate-submission protection. Development and local production preview checks confirmed detail navigation and retrieval after refresh. This uses the existing backend POST API; it does not establish persistence across a backend restart.
- Oct 14 deployment: commit `be1d945` was pushed to GitHub main and Netlify showed Published. The assistant confirmed the updated creation form and enabled button on the live frontend. Live creation and retrieval after refresh remain unverified. The backend stays on Render; Netlify hosts the frontend.
- Oct 14 local UI work: browsing now has a desktop list/map layout, mobile List/Map switching, explicit Search this area, compact buttons and no mouse-wheel map zoom. Field errors identify inputs and focus the first invalid field. Empty coordinates no longer create a map marker. These later changes remain uncommitted and undeployed.
- Oct 14 checks: lint, 64 frontend tests across 21 files and the final production build passed. Local browser checks covered development and production preview, filtering/reset, mobile view switching and 390 px overflow. No complete WCAG audit or physical touch-device test was performed. Backend tests were not rerun during this work. Photos still have no upload or storage.

Sources: dated files in [DAILY PROGRESS](../DAILY%20PROGRESS/) through October 14, including the latest report and October 13 context, plus the latest chat evidence distinguishing local checks, commit/deployment and live verification. The user clarified that refresh checks were local, not live. This planning maintenance did not run tests or deploy changes.

## Active daily schedule

Each active row contains three tasks budgeted at 60 minutes each (3 hours per workday). October 14 completion is recorded above. Remaining tasks stay pending until supported by evidence; budgeted time is not actual time spent. No project work is scheduled for October 17-18.

| Date | Task 1 | Task 2 | Task 3 |
| --- | --- | --- | --- |
| Oct 15 | Review required functional changes and staged files; commit/push only the intended scope, deploy required frontend fixes and confirm its commit (60 min) | Verify live Clerk-authenticated playground creation, detail navigation, refresh retrieval and failure feedback; keep photos as preview only and record results (60 min) | Define/test playground-deletion behavior for related reviews; check required ownership and spoofing cases and fix blockers (60 min) |
| Oct 16 | Verify clean installation and lockfiles from README; run required frontend/backend checks for the final changes (60 min) | Rehearse the architecture, models, permissions, tests and API demo (60 min) | Reconcile brief evidence and handoff notes; check submission files, repository access and live URLs (60 min) |
| Oct 19 | Run final live checks | Submit and confirm success | Reserve time for submission issues and final report |

## Adjustment rules and changes

- October 15 scope clarification: follow the existing backend-focused plan. Optional visual polish, design-token styling and decorative motion are personal extras; exclude them from active tasks and teacher-facing plans and progress reports. Do not undo this work or make its completion a submission requirement. Retain required frontend API integration, validation, error handling and live workflow checks. Prioritize backend behavior, authorization, related-data handling, tests and submission evidence.

- October 7 scope update: include frontend UI and UX work that exposes the new backend features. Backend PATCH implementation does not mean review editing is available in the UI.
- October 13 rollover: frontend deployment and core live checks are complete. Option B adds playground creation/saving on October 14, followed by tests and live verification on October 15. Move relationship/ownership gaps and clean installation to October 15. Replace optional documentation polish and extended Atlas index/export/recovery work to keep the three-hour daily budget. Retain required database access checks during setup/deployment and preserve October 16 demo preparation and October 19 submission time. If creation takes longer, use October 15's time before optional polish; do not add weekends or photo upload before submission.
- October 14 rollover: creation implementation, local checks and its first frontend deployment are complete. Follow the latest report by prioritizing the later UI commit/deployment and live creation verification on October 15. Retain deletion/relationship and ownership checks as the third task. Move clean installation and final regression checks to October 16, replacing part of the rehearsal time; combine architecture and API rehearsal into one hour. Defer further visual polish. If required security or relationship fixes exceed the budget, use October 16 rehearsal time first and record the remaining gap; do not add weekend hours. Keep the October 19, 23:59 deadline.
- Playground creation acceptance: a signed-in user can submit permitted fields, reach the created detail page and read the saved data after refresh. The backend assigns the Clerk owner ID and rejects unauthenticated writes. Failed requests preserve input; saving prevents duplicate submissions. Photo selection remains a clearly labelled local preview and sends no image to the API.
- Preserve existing routes and visual design, reuse Atomic Design components, and keep Clerk. An owner-only Edit button improves the UI but never replaces server authorization. Handle expired sessions and denied edits with clear feedback.
- Review editing acceptance: an owner can open a prefilled form, save permitted fields through PATCH, see the saved values after reload, and cancel without changing data. Non-owners have no edit action and the backend rejects unauthorized requests. Failed saves preserve the user's input.
- Filter/UX acceptance: existing controls use the supported API parameters, reset restores the list, and loading, errors and empty results have clear messages. Check mobile layout, keyboard operation and focus. Prioritize functional clarity over a visual redesign.
- Future nightly updates must track frontend integration and UX gaps alongside backend progress. Keep these tasks pending until DAILY PROGRESS reports their implementation and verification; backend-only success is insufficient.

- Use the latest progress reports. Move unfinished work to the next working day, replacing lower-priority work without adding hours or weekend tasks.
- Initial deployment is complete. Replace the original October 9 deployment and October 12 frontend setup with persistence, relationship and verification gaps.
- October 6 documentation work is complete as reported; October 15 fills gaps rather than rewriting it.
- Carry blockers forward before optional work. Keep the deadline and daily budget.
- Morning drafts run on weekdays at 09:00. Nightly planning maintenance runs daily at 23:00, including weekends, without assigning weekend project work.
- Leave files unchanged when there is no new evidence or correction. Record evidence dates; a plan or intended action is not proof of completion.
- This update changes planning documents only; it does not deploy, mutate test data, commit or push.

## After-submission work (not scheduled before October 19)

- Implement one photo per playground: authenticated upload, server-side file validation, persistent image storage and a saved image URL displayed on the detail page. Verify retrieval after refresh and redeployment, and handle failed uploads and orphaned files. This remains pending and has no assigned completion date.
- Complete extended Atlas index/export/recovery checks deferred by the creation flow. Carry any required security or submission checks forward as blockers instead of deferring them.

---

<details>
<summary>Original baseline (historical reference, superseded by the active schedule)</summary>

# SpielSpot 2.0 | Daily work plan

> **Deadline: Monday, October 19, 2026, at 23:59 (Europe/Berlin)**  
> **14 working days · 3 hours per day · 42 hours total · Weekends off**

Project: [SpielSpot-v2](https://github.com/i-chieh-liu-88/SpielSpot-v2)  
Period: September 30 – October 19, 2026

## Schedule at a glance

| Phase | Dates | Main outcomes |
| --- | --- | --- |
| Week 1: Review and get started | Sep 30 – Oct 2 | Task checklist, test baseline, API and data design review |
| Week 2: Test and deploy | Oct 5–9 | Permission and security checks, first backend deployment |
| Week 3: Verify and prepare | Oct 12–16 | Live workflows, documentation, fixes, demo preparation |
| Submission day | Oct 19 | Final checks, submission, time for unexpected issues |

## Deployment plan included

Use the agreed stack: **Render for the Express API, MongoDB Atlas for the database, and Clerk for authentication**. This is a planning update, not evidence of completed deployment or passing checks.

| Dates | Deployment work | Evidence to record |
| --- | --- | --- |
| Oct 1–2 | Confirm plans, accounts, backend dependencies, and Render commands | Configuration checklist and reproducible installation |
| Oct 7–8 | Prepare Atlas, secrets, security, startup, and health checks | Test results and pre-deployment review |
| Oct 9 | Deploy to Render and verify Atlas writes | HTTPS URL, deployed commit, and database record |
| Oct 12 | Verify auto-deploy, proxy behavior, cold starts, and full workflows | Deployment record and data surviving redeployment |
| Oct 13–14 | Write the deployment guide; verify fresh setup, export, and recovery steps | README, verification notes, and a known-good version |

**Adapt the general guide to SpielSpot v2:**

- Use Mongoose, so Prisma migrations are outside this plan. Keep Clerk instead of adding the guide's custom JWT_SECRET. Cookie and custom login-route checks apply only where those features are actually used.
- Match Render's Root Directory and commands to the repository's dependency layout. Confirm this on October 2 instead of copying single-folder examples.
- Prefer the Render service's outbound IP ranges for the Atlas network allowlist; do not default to allowing all IPs. CORS controls browser access and does not replace authentication or authorization.
- Verify proxy configuration against the actual traffic path. Review index differences first; do not treat syncIndexes(), which can remove indexes, as an automatic deployment step.
- Verify current quotas, sleep behavior, backups, and billing terms on October 1. The guide's prices and limits are not treated as confirmed current facts.

Sources: [Deployment blueprint](https://github.com/i-chieh-liu-88/Backend-Deployment/blob/main/deployment-blueprint.md), [pre-deployment checklist](https://github.com/i-chieh-liu-88/Backend-Deployment/blob/main/pre-deployment-checklist.md), and [platform comparison and concepts](https://github.com/i-chieh-liu-88/Backend-Deployment/blob/main/README.md). For network configuration, see [Render's official Atlas connection guide](https://render.com/docs/connect-to-mongodb-atlas).

## How to use this plan

- Follow the **three tasks for each day**. Change `[ ]` to `[x]` when a task is complete.
- Each time estimate includes research, implementation, and notes. Most days follow **60 + 60 + 60 minutes**.
- **October 7** uses **45 + 60 + 75 minutes**; **October 9** uses **45 + 90 + 45 minutes**. Both total three hours.
- Daily goals describe planned outcomes, not completed work. If a task is already verified, use its time for improvements or fixes.

---

## Week 1 | Review the project and start testing

**September 30 – October 2 · 3 days · 9 hours**

### Wednesday, September 30 | Planning and test baseline

- [ ] **Plan the remaining work** · 60 minutes  
  Compare the project with the brief and the Backend-Deployment plan. List what is implemented, verified, and still missing.

- [x] **Run the existing tests** · 60 minutes
  Run the backend tests and record the results.
  Completed: [September 30 report](../DAILY%20PROGRESS/2026-09-30-progress.md), 16 backend tests passed; the October 6 report records 33 passing tests.

- [x] **Test review deletion** · 60 minutes
  Check that authors can delete their own reviews and other users cannot.
  Completed: [September 30 report](../DAILY%20PROGRESS/2026-09-30-progress.md), automated owner/non-owner checks; [October 5 report](../DAILY%20PROGRESS/2026-10-05-progress.md), live owner deletion and non-owner rejection.

**Daily goal:** A remaining-work checklist and a record of today's test results.

### Thursday, October 1 | Design review and deployment plan

- [ ] **Review the API** · 60 minutes  
  Compare endpoints with documentation and list success and error cases to test.
  Partial: [October 1 report](../DAILY%20PROGRESS/2026-10-01-progress.md) confirms endpoint/documentation checks. A complete success/error scenario list is not confirmed.

- [x] **Check models and the ERD** · 60 minutes
  Verify Playground and Review fields and relationships, and correct outdated descriptions.
  Completed: [October 1 report](../DAILY%20PROGRESS/2026-10-01-progress.md), both models matched the ERD.

- [ ] **Confirm the Render and Atlas plan** · 60 minutes  
  Check accounts, repository access, existing Atlas resources, and deployment regions. Verify current plan costs, quotas, and sleep behavior; list environment variable names and required test accounts.

**Daily goal:** Consistent design documentation and a clear deployment preparation checklist.

### Friday, October 2 | Read and create tests and deployment dependencies

- [ ] **Test read operations** · 60 minutes  
  Cover lists, individual records, empty results, and invalid IDs. Fix small issues and record results.

- [ ] **Test create operations** · 60 minutes  
  Cover valid input, missing fields, and incorrect types. Record remaining fixes.

- [ ] **Prepare backend installation** · 60 minutes  
  Check where runtime dependencies such as Express, Mongoose, and dotenv are declared and verify lockfiles. Define reproducible installation commands, the Node version, Render Root Directory, and start command; update setup notes.

**Daily goal:** Recorded read/create test results and an installation plan that does not rely on accidental parent-folder dependencies.

> October 3–4: Weekend break. No project work scheduled.

---

## Week 2 | Expand tests and deploy the backend

**October 5–9 · 5 days · 15 hours**

### Monday, October 5 | Access permissions

- [ ] **Test update permissions** · 60 minutes  
  Check requests from the owner, another user, and a user who is not signed in.

- [ ] **Test delete permissions** · 60 minutes  
  Check owner access, non-owner access, and requests for missing records.

- [ ] **Test ownership spoofing** · 60 minutes  
  Verify that sending a fake `ownerId` does not allow impersonation. Fix any related issues.

**Daily goal:** Only authorized users can update or delete records.

### Tuesday, October 6 | Reviews and data relationships

- [ ] **Test review operations** · 60 minutes  
  Cover creating reviews, reading reviews, and invalid input.

- [ ] **Define relationship rules** · 60 minutes  
  Test a playground ID that does not exist. Decide what should happen to reviews when a playground is deleted.
  Partial: [October 6 report](../DAILY%20PROGRESS/2026-10-06-progress.md) confirms the live missing-playground 404. Review handling after playground deletion remains unconfirmed.

- [ ] **Implement relationship checks** · 60 minutes  
  Add the necessary checks and tests, and document the agreed behavior.

**Daily goal:** Reviews link to the correct playground, with clear rules for related data.

### Wednesday, October 7 | Real authentication checks and Atlas preparation

- [ ] **Check real authentication and ownership** · 45 minutes  
  Use Postman with valid, missing, and invalid tokens. Confirm account B cannot update or delete account A's records.
  Partial: October 5–6 reports confirm review deletion ownership and missing/invalid-token rejection. Live update ownership and the broader Playground checks remain unconfirmed.

- [ ] **Verify persistence** · 60 minutes  
  Create and update records, read them back, inspect them in Atlas, and check again after restarting the backend. Separate test and production data.
  Partial: [October 5 report](../DAILY%20PROGRESS/2026-10-05-progress.md) confirms a review survives page refresh. Update and restart/redeployment persistence remain unconfirmed.

- [ ] **Prepare Atlas for deployment** · 75 minutes  
  Check the database name, a database user with only required permissions, URI encoding, and the network allowlist plan. Review connection pooling, indexes, and backup/export arrangements for existing data.

**Daily goal:** Evidence of real authentication and persistence, with Atlas requirements ready.

### Thursday, October 8 | Pre-deployment checks

- [ ] **Check errors, 404s, and logs** · 60 minutes  
  Use safe error responses and consistent JSON for unknown routes. Keep tokens, passwords, and sensitive data out of logs; add relevant tests.

- [ ] **Review security and dependencies** · 60 minutes  
  Check Helmet, validation, production CORS origins, proxy behavior, and rate limiting. Review secrets, .gitignore, and .env.example; run npm audit and assess necessary fixes.

- [ ] **Verify startup and health checks** · 60 minutes  
  Check process.env.PORT, the production start command, and NODE_ENV. Add or verify /health with tests, run the backend suite, and record deployment readiness.

**Daily goal:** Deploy only after required checks pass; unresolved startup or security issues remain blockers.

### Friday, October 9 | First deployment on Render

- [ ] **Configure the Render service** · 45 minutes  
  Select SpielSpot-v2 and the deployment branch. Use the verified Root Directory, install/build, and start commands. Obtain the service's outbound IP ranges and update the Atlas allowlist.

- [x] **Deploy and resolve startup issues** · 90 minutes
  Set the required MONGODB_URI, Clerk keys, NODE_ENV, CLIENT_URL, and other applicable variables in Render. Use the platform PORT; inspect build/runtime logs and verify the Atlas connection.
  Completed ahead of schedule: [October 1 report](../DAILY%20PROGRESS/2026-10-01-progress.md) records Render deployment, dependency fixes and environment setup; [October 2 report](../DAILY%20PROGRESS/2026-10-02-progress.md) confirms live reads and a saved review. This checks initial deployment only, not the later PATCH/filter release or the separate health checks.

- [ ] **Run HTTPS smoke checks** · 45 minutes  
  Test /health, public reads, and authenticated create/read requests. Confirm the record in Atlas and note the URL, deployed commit, and remaining issues.

**Daily goal:** The Render API responds over HTTPS and demonstrably writes to Atlas.

> October 10–11: Weekend break. No project work scheduled.

---

## Week 3 | Verify workflows and prepare the submission

**October 12–16 · 5 days · 15 hours**

### Monday, October 12 | Automatic deployment and live workflows

- [ ] **Check production integration and proxy behavior** · 60 minutes  
  Configure the frontend API URL, Clerk, and CORS. Verify client IP handling and rate limiting behind Render's proxy against the actual traffic path.

- [ ] **Verify automatic deployment and persistence** · 60 minutes  
  Use a small reversible change to verify deployment from the watched branch. Check the commit, logs, and /health; confirm existing records survive redeployment and record cold-start behavior.

- [ ] **Verify complete live workflows** · 60 minutes  
  Check CRUD, rejected non-owner requests, lists, detail pages, review submission, and refresh behavior. Fix priority issues.

**Daily goal:** Verified GitHub-to-Render deployment, persistent data across redeploys, and working frontend/API integration.

### Tuesday, October 13 | API documentation and deployment guide

- [ ] **Document the playground API** · 60 minutes  
  Include requests, success/error examples, and relationship rules.

- [ ] **Document reviews and authentication** · 60 minutes  
  Explain review operations, Clerk tokens, permissions, and verified behavior.

- [ ] **Write the README and deployment guide** · 60 minutes  
  Record Render installation/start commands and Root Directory, variable names, Atlas connectivity, /health, auto-deploy, logs, cold starts, backup/index strategy, and the live URL. Use placeholders for sensitive values.

**Daily goal:** Another developer can use the API, deploy it, and troubleshoot common issues.

### Wednesday, October 14 | Fresh setup and recovery preparation

- [ ] **Verify a fresh installation** · 60 minutes  
  Install the frontend and backend in a separate folder using the README. Check runtime dependencies and lockfiles and fix command problems.

- [ ] **Run quality and deployment checks** · 60 minutes  
  Run frontend/backend tests and frontend lint/build. Verify the live commit, logs, and /health, and record unresolved issues.

- [ ] **Prepare recovery and data protection** · 60 minutes  
  Identify a known-good commit and document redeployment steps. Confirm backup options for the actual plan; practice export and reading back test data, and review indexes without resetting production data.

**Daily goal:** Reproducible setup and practical recovery steps for deployment problems.

### Thursday, October 15 | Fixes and requirements review

- [ ] **Fix priority bugs** · 60 minutes  
  Address the remaining issues that affect core functionality.

- [ ] **Run regression tests** · 60 minutes  
  Confirm that the fixes work and have not broken related features.

- [ ] **Check the project against the brief** · 60 minutes  
  Review every requirement and add missing documentation or evidence.

**Daily goal:** Each required item has a verified outcome or a clearly recorded remaining action.

### Friday, October 16 | Demo and submission preparation

- [ ] **Practice the technical explanation** · 60 minutes  
  Explain the architecture, models, permissions, security decisions, and tests.

- [ ] **Rehearse the demo** · 60 minutes  
  Prepare test data and demonstrate a complete API workflow.

- [ ] **Prepare submission materials** · 60 minutes  
  Check repository access, URLs, documentation, and that sensitive values are not included.

**Daily goal:** The project can be explained and demonstrated, and submission materials are ready.

> October 17–18: Weekend break. No project work scheduled.

---

## Submission day | Complete the hand-in

**October 19 · 1 day · 3 hours**

### Monday, October 19 | Final checks and submission

- [ ] **Run final live checks** · 60 minutes  
  Confirm that the API, authentication, and data operations work.

- [ ] **Submit the project** · 60 minutes  
  Share the repository and backend URL, and confirm the submission is successful.

- [ ] **Handle issues and write the final update** · 60 minutes  
  Resolve submission or access problems and finish the project notes.

**Daily goal:** The instructor can access the repository and backend URL, and the project is submitted.

---

## What to do when a task takes longer

1. **Record the blocker:** What failed, what has been tried, and what to do next.
2. **Adjust the next working day:** Replace a lower-priority task instead of automatically adding weekend work.
3. **Protect the essentials:** Prioritize the core API, security, testing, deployment, and documentation. Postpone optional features.

Deployment preparation replaces some repeated review work without adding hours. If the service is not live on October 9, prioritize deployment fixes on October 12 and adjust documentation and demo practice afterward. Keep required security checks and weekends off.

This plan builds on the existing Express, MongoDB, and Clerk backend. Frontend integration supports the core demonstration; new animations, photo uploads, and other extra features are outside this schedule.

## Daily update guide

| Heading | What to include |
| --- | --- |
| **Today's Plan** | The day's three main tasks |
| **Main Risk** | The most likely obstacle to the plan |
| **Risk Mitigation** | How to avoid, reduce, or resolve the risk |

Evening updates should report actual results. Explain unfinished work and the next action rather than describing planned tasks as completed.

> **Reporting reminder:** This work schedule excludes weekends, but the brief requires daily updates. The existing 09:00 English draft schedule still includes weekends. Adjust it separately if the instructor agrees that weekend reports are unnecessary.

**Submit during the day on October 19. Keep the final hour available for submission or access issues.**

</details>
