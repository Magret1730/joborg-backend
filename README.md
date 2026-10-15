# Joborg Backend

Joborg is a backend API for a career page monitoring application.

The backend supports the core MVP functionality needed for user accounts, saved trackers, page monitoring, change logs, alert history, and communication with the frontend.

This project is currently under active development.

## Status

Work in progress.

The backend is being built as the API layer for the Joborg frontend and will continue to evolve as the product grows.

## Overview

The backend provides the server-side foundation for Joborg.

It is responsible for handling authentication, managing user data, storing tracker information, supporting monitoring workflows, recording detected changes, and exposing REST API endpoints that the frontend can consume.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Knex.js
- JWT authentication
- bcrypt
- Cheerio
- Playwright
- Brevo email API
- External scheduler support

## Main Areas

- User authentication
- Protected API routes
- Tracker management
- Career page monitoring
- Change detection records
- Alert history
- Email notification support
- External scheduled checks
- Future admin support

## Database

The backend uses PostgreSQL with Knex migrations.

The database can be configured using environment variables, depending on the deployment setup.

## Frontend and Backend Connection

The backend is designed to connect with the frontend through REST API requests.

For local development, the frontend should point to:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
````

The backend should allow requests from the frontend development URL:

```
http://localhost:3000
```

## Environment Variables

Create a `.env` file in the backend project root for local development.

Example:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=your_database_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000

BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM_NAME=Joborg
EMAIL_FROM_EMAIL=your_verified_sender_email

CRON_SECRET=your_cron_secret
ENABLE_SCHEDULER=false
```

### Notes

* Do not commit `.env` files to GitHub.
* Production environment variables should be configured directly in the hosting provider dashboard.
* `CRON_SECRET` should be a long private value used to protect the external scheduler endpoint.
* `ENABLE_SCHEDULER=false` is recommended when using an external scheduler to avoid duplicate scheduled checks.

## Getting Started

Install dependencies:

```
npm install
```

Run database migrations:

```
npm run migrate
```

Start the development server:

```
npm run dev
```

The backend should run on:

```
http://localhost:5000
```

## Available Scripts

```
npm run dev
```

Starts the backend in development mode.

```
npm run build
```

Builds the TypeScript project.

```
npm run start
```

Runs the compiled backend.

```
npm run migrate
```

Runs database migrations in development.

```
npm run migrate:dev
```

Runs database migrations using the development environment.

```
npm run migrate:prod
```

Runs database migrations using the production environment.

```
npm run migrate:rollback
```

Rolls back the latest migration.

## API Overview

The backend exposes REST API endpoints for authentication, tracker management, manual checks, change logs, alerts, scheduled checks, and user profile data.

Base URL example:

```
http://localhost:5000/api/v1
```

## Authentication

| Method | Endpoint                    | Auth Required | Description                       |
| ------ | --------------------------- | ------------- | --------------------------------- |
| `POST` | `/auth/register`            | No            | Register a new user               |
| `POST` | `/auth/login`               | No            | Log in an existing user           |
| `POST` | `/auth/forgot-password`     | No            | Request a password reset link     |
| `POST` | `/auth/reset-password`      | No            | Reset user password               |
| `POST` | `/auth/resend-verification` | No            | Resend account verification email |

## Trackers

| Method   | Endpoint                  | Auth Required | Description                             |
| -------- | ------------------------- | ------------- | --------------------------------------- |
| `POST`   | `/trackers`               | Yes           | Create a new career page tracker        |
| `GET`    | `/trackers`               | Yes           | Get all trackers for the logged-in user |
| `GET`    | `/trackers/:id`           | Yes           | Get a single tracker by ID              |
| `PUT`    | `/trackers/:id`           | Yes           | Update an existing tracker              |
| `DELETE` | `/trackers/:id`           | Yes           | Delete a tracker                        |
| `PATCH`  | `/trackers/:id/pause`     | Yes           | Pause an active tracker                 |
| `PATCH`  | `/trackers/:id/resume`    | Yes           | Resume a paused tracker                 |
| `GET`    | `/trackers/:id/check-now` | Yes           | Manually check a tracker for changes    |

## Change Logs

| Method | Endpoint       | Auth Required | Description                     |
| ------ | -------------- | ------------- | ------------------------------- |
| `GET`  | `/changes`     | Yes           | Get detected page changes       |
| `GET`  | `/changes/:id` | Yes           | Get a specific change log by ID |

## Alerts

| Method | Endpoint  | Auth Required | Description                              |
| ------ | --------- | ------------- | ---------------------------------------- |
| `GET`  | `/alerts` | Yes           | Get alert history for the logged-in user |

## External Cron Job

| Method | Endpoint     | Auth Required        | Description                      |
| ------ | ------------ | -------------------- | -------------------------------- |
| `GET`  | `/cron-jobs` | Cron Secret Required | Trigger scheduled tracker checks |

The cron endpoint is intended for an external scheduler.

It checks active trackers and starts the monitoring workflow. If a change is detected, the backend records the change and can send an email notification.

### Required Cron Header

```
x-cron-secret: your_cron_secret
```

The value must match the backend `CRON_SECRET` environment variable.

### Production Schedule

The current external scheduler runs at:

```
10:00 AM
2:00 PM
6:00 PM
```

Crontab expression:

```
0 10,14,18 * * *
```

### Scheduler Notes

* The external scheduler is used to improve reliability on free hosting platforms.
* The cron endpoint responds quickly while the tracker check continues in the background.
* The cron secret should never be committed to GitHub.
* The internal Node scheduler can be disabled in production by setting:

```env
ENABLE_SCHEDULER=false
```

## User

| Method | Endpoint        | Auth Required | Description              |
| ------ | --------------- | ------------- | ------------------------ |
| `GET`  | `/users/me/:id` | Yes           | Get user profile details |

## Example Tracker Request

```json
{
  "company_name": "Example Company",
  "label": "Example Careers",
  "url": "https://example.com/careers"
}
```

## Authentication Header

Protected endpoints require a bearer token.

```
Authorization: Bearer <token>
```

## Deployment Notes

The backend can be deployed as a Node.js web service.

Recommended production setup:

```
Frontend: Vercel
Backend API: Render
Database: PostgreSQL / Neon
Email: Brevo API
Scheduler: External cron service
```

The backend should be configured with production environment variables before deployment.

## Links

* Frontend Repository: [Frontend GitHub Link](https://github.com/Magret1730/joborg-frontend)
* Backend Repository: [Backend GitHub Link](https://github.com/Magret1730/joborg-backend)
* Live Frontend: [Deployment Link](https://joborg-frontend.vercel.app/)
* Live Backend: [Deployment Link](https://joborg-backend.onrender.com)

## Notes

This project is still in progress.

The backend is being developed with a focus on clean structure, reusable services, authentication, database-backed features, scheduled monitoring, and frontend integration.
