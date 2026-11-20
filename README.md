# Goodbooks Library — Frontend

React + Vite frontend for the Week 6 assignment. It talks to the FastAPI backend in
[week6-assignment-backend](https://github.com/gdiazcasanas/week6-assignment-backend),
and follows the "Library App Frontend Design" (teal `#0F5C5C` on off-white, Space Grotesk
headings, Inter body).

## Run it

1. **Start the backend** (from the `week6-assignment-backend` folder, which sits next to
   this one — not inside it). It needs Docker Desktop running:

   ```bash
   docker compose up -d --build
   ```

   Check http://localhost:8000/health shows `"status": "ok"`.

2. **Start the frontend** (from this folder):

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:5173.

The API URL defaults to `http://localhost:8000`. To use a different one, copy
`.env.example` to `.env.local` and change `VITE_API_URL`.

## Sample data

The database starts empty. Either:

- `docker exec week6_api python -m app.scripts.seed_authors --count 50` — the backend's
  script: fake names, removable later with `app.scripts.clear_sample_authors`.
- `npm run seed` — adds 14 well-known authors (Austen, Tolkien, Le Guin, …) through the API.
  Skips any that already exist. These count as real authors, so the backend's clear
  script leaves them alone.

## Features

**Authors** (`/authors` endpoints):

- List sorted by last name, 10 per page with Previous / Next
- Search by first or last name as you type (`GET /authors?q=`)
- Add an author (`POST /authors`)
- Edit an author in the same form (`PATCH /authors/{id}`)
- Delete with a confirmation (`DELETE /authors/{id}`)
- Field errors from both client-side checks and the API's `422` responses
- Header badge shows whether the API is reachable (`GET /health`)

## Project layout

```
src/
├── api.js                  # fetch wrapper + /authors and /health calls, error mapping
├── App.jsx                 # page shell
├── index.css               # design tokens (colors, fonts, radii) and base styles
├── components/
│   ├── Header.jsx/.css     # brand, nav, API status badge
│   └── AuthorForm.jsx      # add / edit form with validation
└── pages/
    └── AuthorsPage.jsx/.css # list, search, paging, delete
scripts/
└── seed-authors.mjs        # npm run seed
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on port 5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Oxlint |
| `npm run seed` | Add the 14 sample authors through the API |
