import mongoose, { Schema, Model } from 'mongoose';
import type { Character } from '@/types';

const CharacterSchema = new Schema<Character>(
  {
    name: {
      type: String,
      required: [true, 'Character name is required'],
      trim: true,
    },
    description: String,
    role: String,
    defaultOutfit: {
      type: Schema.Types.ObjectId,
      ref: 'Outfit',
    },
    physicalTraits: {
      height: String,
      build: String,
      notes: String,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Text index for search
CharacterSchema.index({ name: 'text', description: 'text', role: 'text' });

const CharacterModel: Model<Character> =
  mongoose.models.Character ||
  mongoose.model<Character>('Character', CharacterSchema);

export default CharacterModel;
