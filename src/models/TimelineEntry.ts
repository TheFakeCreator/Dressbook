import mongoose, { Schema, Model } from 'mongoose';
import type { TimelineEntry } from '@/types';

const TimelineEntrySchema = new Schema<TimelineEntry>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: [true, 'Character is required'],
    },
    outfitId: {
      type: Schema.Types.ObjectId,
      ref: 'Outfit',
      required: [true, 'Outfit is required'],
    },
    chapter: {
      type: Schema.Types.Mixed,
      required: [true, 'Chapter is required'],
    },
    scene: String,
    timestamp: String,
    storyDate: Date,
    notes: String,
    context: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
TimelineEntrySchema.index({ characterId: 1, chapter: 1 });
TimelineEntrySchema.index({ chapter: 1 });

const TimelineEntryModel: Model<TimelineEntry> =
  mongoose.models.TimelineEntry ||
  mongoose.model<TimelineEntry>('TimelineEntry', TimelineEntrySchema);

export default TimelineEntryModel;
