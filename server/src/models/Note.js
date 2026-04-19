import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sourceType: { type: String, enum: ['text', 'pdf', 'video', 'audio'], required: true },
    category: { type: String, default: 'General', trim: true, maxlength: 40 },
    favorite: { type: Boolean, default: false },
    revisionReminderAt: { type: Date, default: null },
    title: { type: String, required: true },
    shortSummary: { type: String, required: true },
    detailedSummary: { type: String, required: true },
    keywords: [{ type: String, required: true }]
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
