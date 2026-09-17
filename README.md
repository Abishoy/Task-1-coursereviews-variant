# Task 1 (Variant): Course Review Board API

You are building the backend for a course review board. Anyone can browse
and post course reviews — there's no login for this variant.

Express + MongoDB (Mongoose), one entity that needs full CRUD and request
validation. The wrinkle in this variant is a real aggregation query.

## What's already done for you

- `server/src/index.js`, `server/src/app.js`, `server/src/config/db.js` —
  app bootstrap and DB connection.
- `server/src/models/User.js` — a plain user schema (`name`, `email`,
  `passwordHash`). It's not tied to any login flow here; it exists so
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
MONGO_URI=<ADD_YOUR_CONNECTION_STRING_HERE>
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

Joi (or your choice) schema for create/update. `rating` must be an integer
1-5.

### 3. Controller + routes

| method | path | behavior |
|---|---|---|
| GET | `/api/reviews` | list all reviews, newest first |
| GET | `/api/reviews/:id` | get one review |
| GET | `/api/reviews/summary?courseCode=CS101` | course-wide average rating + count |
| POST | `/api/reviews` | create a review |
| PATCH | `/api/reviews/:id` | partial update |
| DELETE | `/api/reviews/:id` | delete |

Mind the route order — `/summary` needs to be registered before `/:id`, or
Express will try to treat `"summary"` as an `:id` and your `findById` will
blow up. Figure out why, don't just memorize the fix.

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

## Grading focus

1. Does the model match the field table (types, enums, defaults)?
2. Does validation reject bad input (missing courseCode, rating out of 1-5)?
3. Does the unique index actually stop a duplicate review (409, not a 500)?
4. Is `/summary` a real aggregation pipeline, not a `find()` + JS loop?
5. (bonus) `.populate()`.

You're expected to use AI tools while building this — that's fine and
expected. But you should be able to explain, for any line in your
controller, *why* it's there and what happens if you delete it. We will ask.
