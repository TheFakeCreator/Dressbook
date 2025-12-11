import mongoose, { Schema, Model } from 'mongoose';
import type { Outfit } from '@/types';

const OutfitItemSchema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true,
  },
  layer: {
    type: Number,
    default: 0,
  },
  category: String,
});

const OutfitSchema = new Schema<Outfit>(
  {
    name: {
      type: String,
      required: [true, 'Outfit name is required'],
      trim: true,
    },
    description: String,
    items: [OutfitItemSchema],
    tags: [String],
    occasion: String,
    season: String,
    compositeImage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
OutfitSchema.index({ name: 'text', description: 'text' });
OutfitSchema.index({ tags: 1 });

const OutfitModel: Model<Outfit> =
  mongoose.models.Outfit || mongoose.model<Outfit>('Outfit', OutfitSchema);

export default OutfitModel;
