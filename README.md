# Joborg Backend

Joborg is a backend API for a career page monitoring application.

The backend supports the core MVP functionality needed for user accounts, saved trackers, monitoring activity, and communication with the frontend.

This project is currently under active development.

## Status

Work in progress.

The backend is being built as the API layer for the Joborg frontend and will continue to evolve as the product grows.

## Overview

The backend provides the server-side foundation for joborg.

It is responsible for handling authentication, managing user data, storing tracker information, supporting monitoring workflows, and providing API endpoints that the frontend can consume.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Knex.js
- JWT authentication
- bcrypt
- Cheerio
- Node.js built-in utilities
- Email notification support planned

## Main Areas

- User authentication
- Protected API routes
- Tracker management
- Page monitoring support
- Activity records
- Alert history
- Future admin support

## Database

The backend uses PostgreSQL with Knex migrations.

## Frontend and Backend Connection

The backend is designed to connect with the frontend through REST API requests.

For local development, the frontend should point to:

```NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1```

```
Create a `.env` file in the backend project root:

PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

The backend should allow requests from the frontend development URL:

http://localhost:3000
```

## Getting Started

- Install dependencies:

`npm install`

- Run database migrations:

`npm run migrate`

- Start the development server:

`npm run dev`

- The backend should run on:

`http://localhost:5000`

## Available Scripts

`npm run dev` 
Starts the backend in development mode.

`npm run build`  
Builds the TypeScript project.

`npm run start`
Runs the compiled backend.

`npm run migrate  `
Runs database migrations.

`npm run migrate:rollback  `
Rolls back the latest migration.

## API Overview

The backend exposes REST API endpoints for authentication, tracker management, manual checks, change logs, alerts, and user profile data.

> Base URL example: `http://localhost:5000/api/v1`  

---

## Authentication

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Log in an existing user |
| `POST` | `/auth/forgot-password` | No | Request a password reset link |
| `POST` | `/auth/reset-password` | No | Reset user password |

---

## Trackers

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/trackers` | Yes | Create a new career page tracker |
| `GET` | `/trackers` | Yes | Get all trackers for the logged-in user |
| `GET` | `/trackers/:id` | Yes | Get a single tracker by ID |
| `PUT` | `/trackers/:id` | Yes | Update an existing tracker |
| `DELETE` | `/trackers/:id` | Yes | Delete a tracker |
| `PATCH` | `/trackers/:id/pause` | Yes | Pause an active tracker |
| `PATCH` | `/trackers/:id/resume` | Yes | Resume a paused tracker |
| `GET` | `/trackers/:id/check-now` | Yes | Manually check a tracker for changes |

---

## Change Logs

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/changes` | Yes | Get detected page changes |
| `GET` | `/changes/:id` | Yes | Get a specific change log by ID |

---

## Alerts

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/alerts` | Yes | Trigger or manage tracker alert behavior |

---

## User

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/users/me/:id` | Yes | Get user profile details |

---

## Example Tracker Request

```json
{
  "company_name": "Example Company",
  "label": "Example Careers",
  "url": "https://example.com/careers"
}
```

---

## Authentication Header

Protected endpoints require a bearer token.

```txt
Authorization: Bearer <token>
```

---

## Notes

- Most tracker-related endpoints require authentication.
- Manual tracker checks may be rate-limited to reduce unnecessary load.
- Endpoint prefixes may vary depending on the backend route mounting configuration.

## Links

- Frontend Repository: [Frontend GitHub Link](https://github.com/Magret1730/joborg-frontend)
- Backend Repository: [Backend GitHub Link](https://github.com/Magret1730/joborg-backend)
<!-- - Live Frontend: [Add deployed frontend link here] -->

## Notes

This project is still in progress.

The backend is being developed with a focus on clean structure, reusable services, authentication, database-backed features, and frontend integration.
