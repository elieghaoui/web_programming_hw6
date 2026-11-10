import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    duration: { type: Number, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Workout = mongoose.model('Workout', workoutSchema);
