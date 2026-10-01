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

- [ ] **Run the existing tests** · 60 minutes  
  Run the backend tests and record the results.

- [ ] **Test review deletion** · 60 minutes  
  Check that authors can delete their own reviews and other users cannot.

**Daily goal:** A remaining-work checklist and a record of today's test results.

### Thursday, October 1 | Design review and deployment plan

- [ ] **Review the API** · 60 minutes  
  Compare endpoints with documentation and list success and error cases to test.

- [ ] **Check models and the ERD** · 60 minutes  
  Verify Playground and Review fields and relationships, and correct outdated descriptions.

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

- [ ] **Implement relationship checks** · 60 minutes  
  Add the necessary checks and tests, and document the agreed behavior.

**Daily goal:** Reviews link to the correct playground, with clear rules for related data.

### Wednesday, October 7 | Real authentication checks and Atlas preparation

- [ ] **Check real authentication and ownership** · 45 minutes  
  Use Postman with valid, missing, and invalid tokens. Confirm account B cannot update or delete account A's records.

- [ ] **Verify persistence** · 60 minutes  
  Create and update records, read them back, inspect them in Atlas, and check again after restarting the backend. Separate test and production data.

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

- [ ] **Deploy and resolve startup issues** · 90 minutes  
  Set the required MONGODB_URI, Clerk keys, NODE_ENV, CLIENT_URL, and other applicable variables in Render. Use the platform PORT; inspect build/runtime logs and verify the Atlas connection.

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
