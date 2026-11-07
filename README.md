# TASK API

A simple Node.js + Express + Prisma API for managing tasks

## Run locally

Install dependencies with `npm ci`, copy `.env.example` to `.env`, and set a local PostgreSQL `DATABASE_URL`. Run `npm run migrate:dev`, `npx prisma generate`, `npm run seed:dev`, and `npm run dev`. Swagger UI is available at http://localhost:3000/api-docs.

## Filter tasks

- `GET /tasks` returns all tasks.
- `GET /tasks?completed=true` returns only completed tasks.
- `GET /tasks?completed=false` returns only incomplete tasks.
- Other completed values, including empty or repeated values, return HTTP 400.

## Verify

Create a separate local PostgreSQL database whose name ends with `_test`. Copy `.env.test.example` to `.env.test` and set its connection string. Apply the schema to this database with `node --env-file=.env.test node_modules/prisma/build/index.js migrate deploy`, then run `npm test` and `npm run lint`. Tests create and remove only their own fixtures.

With the local API running against seeded data, run `npm run test:postman`, or import `tests/tasks.postman_collection.json` into Postman and run the collection. It checks all four required requests and compares filtered task IDs with the unfiltered response. To check production, override its `baseUrl` collection variable with the Render URL.

## Render

Use a Node web service connected to this repository with auto-deploy enabled. Set `NODE_ENV=production` and `DATABASE_URL` to the Render Postgres internal connection URL.

- Build command: `npm ci && npx prisma generate && npm run migrate:deploy && npm run seed:prod`
- Start command: `npm start`
- Health check: `/health`

The production seed adds sample tasks only if the database is empty. Swagger UI's default server is the current origin, so `/api-docs` works locally and on Render.
