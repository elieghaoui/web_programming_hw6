# Workouts API

A simple REST API for logging workouts, made with Express and MongoDB.

## How to run

1. Run `npm install`
2. Copy `.env.example` to `.env` and add your MongoDB connection string
3. Run `npm run dev`

The server runs on http://localhost:3000

## Routes

**GET /api/workouts** - get all workouts

Response (200):
```json
[{ "_id": "6af2574831fb39f8d0da2fa3", "title": "Leg day", "duration": 45, "notes": "squats" }]
```

**GET /api/workouts/:id** - get one workout

Response (200):
```json
{ "_id": "6af2574831fb39f8d0da2fa3", "title": "Leg day", "duration": 45, "notes": "squats" }
```

**POST /api/workouts** - create a workout

Request:
```json
{ "title": "Leg day", "duration": 45, "notes": "squats" }
```
Response (201): the new workout

**PUT /api/workouts/:id** - update a workout

Request:
```json
{ "title": "Leg day", "duration": 60, "notes": "squats and lunges" }
```
Response (200): the updated workout

**DELETE /api/workouts/:id** - delete a workout

Response (204): no body

## Errors

Errors come back like this:
```json
{ "error": "Workout not found" }
```
400 for bad input or a bad id, 404 if the workout doesn't exist.

## Testing

The Postman collection is in the `postman` folder.
