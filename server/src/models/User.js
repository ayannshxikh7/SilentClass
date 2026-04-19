import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notificationsEnabled: { type: Boolean, default: true },
      reminderFrequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'weekly' }
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
