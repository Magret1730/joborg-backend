# joborg Backend

joborg is a career page tracking app that helps users monitor company job/career pages and get notified when changes are detected.

This repository contains the backend API for joborg.

---

## Project Overview

The joborg backend handles:

- User authentication
- Tracker management
- URL validation
- Career page detection
- Page fetching
- HTML cleaning
- Hash creation
- Change detection
- Email notifications
- Alert history
- Cron jobs

In MVP 1, the backend checks whether a saved career page has changed since the last check.

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt
- Nodemailer
- node-cron
- Cheerio

---

## MVP 1 Features

### Authentication

Users can:

- Register
- Log in
- Access protected routes
- Fetch their profile

---

### Trackers

Users can:

- Add a career page tracker
- View saved trackers
- Edit tracker details
- Delete trackers
- Pause trackers
- Resume trackers
- Manually check a tracker

---

### URL Validation

The backend checks that submitted URLs:

- Are valid URLs
- Start with `http://` or `https://`
- Are reachable
- Are not local or internal URLs
- Look like career/job pages

---

### Change Detection

The backend:

- Fetches the career page
- Cleans the HTML
- Creates a hash of the page content
- Compares the new hash with the saved hash
- Creates a change log when a change is detected

---

### Email Alerts

The backend sends an email notification when a tracked page changes.

---

## Folder Structure

```txt
src/
  app.ts
  server.ts

  config/
  controllers/
  middleware/
  routes/
  services/
  utils/

prisma/
  schema.prisma