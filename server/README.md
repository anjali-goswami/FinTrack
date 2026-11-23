# Personal Finance Tracker API

## Run locally

1. Copy `.env.example` to `.env` and set `MONGO_URI` to a reachable MongoDB database. Set `JWT_SECRET` to a random value with at least 32 characters.
2. From `server/`, run `npm install` once and then `npm run dev`.
3. From `client/`, run `npm run dev`. Vite proxies `/api` requests to `http://localhost:5000`.

The frontend stores the returned JWT in local storage and sends it as a bearer token. New users are isolated by their MongoDB user ID. Each new account starts with empty budgets and expenses; browser-local data is not copied into new accounts.

## API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/budgets`, `PUT|DELETE /api/budgets/:id`
- `GET|POST /api/expenses`, `PUT|DELETE /api/expenses/:id`
- `GET /api/dashboard`
- `GET /api/health`

Budget, expense, and dashboard routes require `Authorization: Bearer <token>`.
