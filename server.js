import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Workout } from './models/Workout.js';

const dbUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT) || 3000;

const app = express();
app.use(cors());
app.use(express.json());

function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} ${req.method} ${req.path}`);
  next();
}
app.use(logger);

// checks the body before create / update
function validateWorkout(req, res, next) {
  const { title, duration, notes } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (title.trim().length > 100) {
    return res.status(400).json({ error: 'title must be 100 characters or less' });
  }
  if (typeof duration !== 'number' || duration <= 0) {
    return res.status(400).json({ error: 'duration must be a number greater than 0 (minutes)' });
  }
  if (notes !== undefined && typeof notes !== 'string') {
    return res.status(400).json({ error: 'notes must be a string' });
  }
  next();
}

// checks the :id before hitting the database
function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

// GET all (optional ?search=)
app.get('/api/workouts', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const re = { $regex: search, $options: 'i' };
    const workouts = await Workout.find({ title: re }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

// GET one
app.get('/api/workouts/:id', checkId, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

// POST create
app.post('/api/workouts', validateWorkout, async (req, res) => {
  try {
    const { title, duration, notes } = req.body;
    const workout = await Workout.create({ title, duration, notes });
    res.status(201).json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT replace
app.put('/api/workouts/:id', checkId, validateWorkout, async (req, res) => {
  try {
    const { title, duration, notes = '' } = req.body;
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { title, duration, notes },
      { new: true, runValidators: true }
    );
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
app.delete('/api/workouts/:id', checkId, async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

// nothing matched
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// catches broken JSON bodies so the client still gets JSON back
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

try {
  await mongoose.connect(dbUri);
  console.log('connected to MongoDB');
  app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}
