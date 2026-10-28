# Brightly — Backend (CST3144 coursework)

Node.js + Express REST API for **Brightly**, an after-school lesson booking app.
The Vue.js frontend lives in its own repository:
[CST3144-AfterClass-Frontend](https://github.com/Benjaminofili/CST3144-AfterClass-Frontend).

**Last updated:** 2026-10-28

## Stack

| Package | Purpose |
|---|---|
| `express` | Web server and routing |
| `cors` | Lets the frontend (on GitHub Pages) call this API from another origin |
| `morgan` | Logs every request (method, URL, status, size, response time) |
| `nodemon` | Restarts the server on file changes (`npm run dev`) |

MongoDB (native driver) has not been added yet; lessons are currently held in memory.

## Files

| File | What it does |
|---|---|
| `server.js` | Express app: middleware, routes and the 404 handlers |
| `lesson.js` | The lesson data (12 lessons) exported as an array |
| `images/` | Lesson photos served at `/images/...` |
| `package.json` / `package-lock.json` | Dependencies and the `start` / `dev` scripts |

## Running locally

```bash
npm install
npm start        # node server.js
npm run dev      # nodemon server.js
```

The server listens on `process.env.PORT`, or `3000` if it is not set: <http://localhost:3000/>.

## Routes

| Method | Path | Behaviour |
|---|---|---|
| GET | `/` | Health check, returns a short JSON message |
| GET | `/lessons` | Returns all lessons from `lesson.js` as JSON |
| POST | `/orders` | Expects JSON with `name`, `phone` and a non-empty `items` array. Returns `400` if any are missing, otherwise `200` with a confirmation message. The order is **not saved yet** |
| PUT | `/lessons/:id` | Updates fields of one lesson in memory and returns it. `404` if the id is unknown, `400` if the body tries to change `id` or sets `space` to something other than a non-negative integer |
| GET | `/images/<file>` | Serves a file from `images/`; a missing image returns `404` JSON `{"error": "404 - Image not found"}` |
| any | anything else | `404` JSON `{"error": "404 - Resource not found"}` |

## Known notes

- Lesson data lives in memory, so changes made with `PUT /lessons/:id` are lost when the server restarts.
- `lesson.js` points each lesson at `/images/lesson-1.jpg` … `/images/lesson-12.jpg`, but the files in
  `images/` are named by subject (`art.jpg`, `chess.jpg`, …). Those lesson image URLs currently return
  the image 404 response.
- Planned: MongoDB Atlas with the native driver, and deployment to Render.

## History

This code was first written inside the combined coursework repository
(`CST3144-AfterClass-Frontend`, commit `0bcb20f`) and moved here on 2026-10-28 so the frontend and
backend can be submitted as two separate repositories. The backend had no earlier commits of its own.

## Change log

| Date | Change |
|---|---|
| 2026-10-28 | Moved into its own repository; added `.gitignore` and this README. No code changes. |
