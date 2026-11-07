# Completed filter implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the assignment's optional `completed` query filter and verify the deployed API.

**Architecture:** Validate exact query strings in the existing middleware, convert to a boolean in the controller, pass through the service, and apply Prisma's `where` condition in the repository. Omission preserves all tasks, including nullable legacy values.

**Tech Stack:** Express 5, express-validator, Prisma 7, PostgreSQL, OpenAPI 3.1, Node's test runner, Postman/Newman.

**Spec:** The user's assignment: `true` returns completed tasks, `false` returns incomplete tasks, omission returns all tasks, and invalid input returns HTTP 400. Test locally and in Swagger UI, make separate feature/documentation commits, push to the user's fork, verify Render, and create `submission.txt` containing only the production URL without a trailing slash.

## Constraints and review focus

- Preserve the existing response format and POST behavior.
- Do not treat the string `false` as truthy or omit the false filter.
- Reject empty, uppercase, numeric, and duplicate completed values.
- No production schema changes or destructive seeding.
- Use a separate local test database; keep credentials out of Git.

## Task 1: Filtering

Files: `src/middleware/validateTask.js`, `src/routes/taskRoutes.js`, `src/controllers/taskController.js`, `src/services/taskService.js`, `src/repositories/taskRepo.js`, `tests/completed.test.js`, `tests/tasks.postman_collection.json`, `package.json`.

Interfaces: `getAllTasks(completed?: boolean)` and `findAll(completed?: boolean)` return arrays. The controller reads the validated query without mutating Express 5's query getter.

- [x] Add HTTP integration tests using real PostgreSQL fixtures: true, false, and null.
- [x] Run tests against starter; observe missing filter/validation failures.
- [x] Implement strict validation, boolean conversion, and Prisma filtering.
- [x] Run full tests, lint, and the Postman collection against localhost.
- [x] Commit as `feat: filter tasks by completed status`.

## Task 2: Documentation and deployment

Files: `docs/openapi.yaml`, deployment instructions if needed, and workspace `submission.txt`.

- [x] Document the optional boolean query, omission behavior, and 400 response.
- [x] Validate OpenAPI and exercise local Swagger UI.
- [ ] Commit as `docs: document completed task filtering`.
- [ ] Review changes and push commits to the fork's deployed branch.
- [ ] Verify Render deployment and live Swagger filtering; write the confirmed production URL to `submission.txt`.

## Progress

- Starter cloned at commit `671ce5698f3548de75a4db6d1baa632bb178f770`; no existing tests.
- Working in a new local clone within the authorized workspace.
- The user completed signup and approved a free Render database and web service, plus the GitHub app installation scoped to this repository.
- Local verification: 15 integration tests passed (12 failed before implementation), lint passed, Postman 4 requests/12 assertions passed, and Swagger UI returned correct true/false/omitted responses.
- Render URL: https://onorman-task-api.onrender.com. Auto-deploy is On Commit for main. Initial deployment is in progress.
- Ruling: Corrected the starter ESLint severity from `none` to `off` after the lint command rejected its configuration; no application behavior changed.
