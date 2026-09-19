# Task 1 (Variant): Course Review Board API

You are building the backend for a course review board. Anyone can browse
and post course reviews — there's no login for this variant.

Express + MongoDB (Mongoose), one entity that needs full CRUD and request
validation. The wrinkle in this variant is a real aggregation query.

## What's already done for you

- `server/src/index.js`, `server/src/app.js`, `server/src/config/db.js` —
  app bootstrap and DB connection.
- `server/src/models/User.js` — a plain user schema (`name`, `email`,
  `password`). It's not tied to any login flow here; it exists so
  `Review.reviewedBy` has something to reference.
- `server/src/controllers/userController.js` + `server/src/routes/users.js`
  — full CRUD over users, already wired, as a worked example of what your
  `reviewController.js` should look like structurally (validation → DB
  call → response, one function per route).

Run `npm install` then `npm run dev` inside `server/` once you've filled in
the TODOs below. There is no `.env` provided — create your own
`server/.env` (it's git-ignored) with the keys below.

## Database connection

Create `server/.env` yourself with:

```
PORT=4000
MONGO_URI=mongodb://ziadmaged_db_user:aoLMeM6xgPb8dX0P@ac-epwm1yp-shard-00-00.wiomvln.mongodb.net:27017,ac-epwm1yp-shard-00-01.wiomvln.mongodb.net:27017,ac-epwm1yp-shard-00-02.wiomvln.mongodb.net:27017/?ssl=true&replicaSet=atlas-6haoei-shard-0&authSource=admin&appName=Cluster0
```

## What you need to build

### 1. The `Review` model — `server/src/models/Review.js`

| field | type | rules |
|---|---|---|
| `courseCode` | String | required (e.g. `"CS101"`) |
| `rating` | Number | required, integer, `min: 1`, `max: 5` |
| `comment` | String | optional |
| `reviewedBy` | ObjectId ref `User` | optional, plain field like any other |

Add `{ timestamps: true }` and a **compound unique index** on
`{ courseCode, reviewedBy }` — one review per user per course.

### 2. Validation — inside `server/src/controllers/reviewController.js`

Joi schema for create/update. `rating` must be an integer
1-5.

### 3. Controller + routes

Implement full CRUD over reviews — create, read one, read all, update, and
delete — plus a separate, unscoped read-only endpoint that returns an
aggregate summary for a given course. Decide the paths and HTTP methods
yourself, following standard REST conventions. Think carefully about the
order you register routes in: a specific static route can get shadowed by
a dynamic parameterized one if it's registered after it — figure out why,
don't just memorize the fix.

### 4. The aggregation — the actual point of this variant

`GET /api/reviews/summary?courseCode=CS101` should return something like
`{ courseCode: "CS101", averageRating: 4.2, reviewCount: 17 }`, computed
with Mongoose's `.aggregate()` — not by pulling every matching document
into Node and averaging in JavaScript. Read the Mongoose aggregation docs;
this is your first real use of the pipeline instead of `find()`.

### 5. Stretch goal — populate

Use Mongoose's `.populate('reviewedBy')` on `getAllReviews`/`getReview` so
the response includes the referenced user's `name`/`email` instead of just
an id.

You're expected to use AI tools while building this — that's fine and
expected. But you should be able to explain, for any line in your
controller, *why* it's there and what happens if you delete it. We will ask.
