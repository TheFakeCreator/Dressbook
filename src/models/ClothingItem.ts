import mongoose, { Schema, Model } from 'mongoose';
import type { ClothingItem } from '@/types';

const ImageDataSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: String,
  caption: String,
  isPrimary: {
    type: Boolean,
    default: false,
  },
  thumbnail: String,
  width: Number,
  height: Number,
});

const RealWorldReferenceSchema = new Schema({
  historicalPeriod: {
    type: String,
    trim: true,
  },
  periodStart: Number,
  periodEnd: Number,
  geographicOrigin: {
    type: String,
    trim: true,
  },
  culturalContext: String,
  historicalDescription: String,
  referenceSources: [String],
  accuracyNotes: String,
});

const ClothingItemSchema = new Schema<ClothingItem>(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Head',
        'Face',
        'Neck',
        'Torso Upper',
        'Torso Lower',
        'Full Body',
        'Hands',
        'Feet',
        'Legs',
        'Back',
        'Accessories',
      ],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    images: [ImageDataSchema],
    tags: [String],
    colors: [String],
    materials: [String],
    style: String,
    era: String,
    culture: String,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unisex'],
      default: 'Unisex',
    },
    realWorldReference: RealWorldReferenceSchema,
    // Variation system fields
    parentItem: {
      type: Schema.Types.ObjectId,
      ref: 'ClothingItem',
      default: null,
    },
    baseItemId: {
      type: Schema.Types.ObjectId,
      ref: 'ClothingItem',
      default: null,
    },
    variationAttributes: {
      type: Map,
      of: String,
      default: {},
    },
    variations: [{
      type: Schema.Types.ObjectId,
      ref: 'ClothingItem',
    }],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search performance
ClothingItemSchema.index({ name: 'text', description: 'text', tags: 'text' });
ClothingItemSchema.index({ category: 1 });
ClothingItemSchema.index({ tags: 1 });
ClothingItemSchema.index({ gender: 1 });
ClothingItemSchema.index({
  'realWorldReference.periodStart': 1,
  'realWorldReference.periodEnd': 1,
});
ClothingItemSchema.index({ 'realWorldReference.geographicOrigin': 1 });
// Variation indexes
ClothingItemSchema.index({ parentItem: 1 });
ClothingItemSchema.index({ baseItemId: 1 });
ClothingItemSchema.index({ 'variationAttributes': 1 });

// Prevent model recompilation in development
const ClothingItemModel: Model<ClothingItem> =
  mongoose.models.ClothingItem ||
  mongoose.model<ClothingItem>('ClothingItem', ClothingItemSchema);

export default ClothingItemModel;
