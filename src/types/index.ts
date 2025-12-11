// TypeScript types for all entities

export interface ImageData {
  url: string;
  publicId?: string;
  caption?: string;
  isPrimary: boolean;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface RealWorldReference {
  historicalPeriod?: string;
  periodStart?: number;
  periodEnd?: number;
  geographicOrigin?: string;
  culturalContext?: string;
  historicalDescription?: string;
  referenceSources?: string[];
  accuracyNotes?: string;
}

export interface ClothingItem {
  _id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  images: ImageData[];
  tags: string[];
  colors: string[];
  materials: string[];
  style?: string;
  era?: string;
  culture?: string;
  gender?: 'Male' | 'Female' | 'Unisex';
  realWorldReference?: RealWorldReference;
  // Variation system fields
  parentItem?: string | ClothingItem | null;
  baseItemId?: string | ClothingItem | null;
  variationAttributes?: Record<string, string>;
  variations?: string[] | ClothingItem[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutfitItem {
  itemId: string | ClothingItem;
  layer: number;
  category?: string;
}

export interface Outfit {
  _id: string;
  name: string;
  description?: string;
  items: OutfitItem[];
  tags: string[];
  occasion?: string;
  season?: string;
  compositeImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  _id: string;
  name: string;
  description?: string;
  role?: string;
  defaultOutfit?: string | Outfit;
  physicalTraits?: {
    height?: string;
    build?: string;
    notes?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEntry {
  _id: string;
  characterId: string | Character;
  outfitId: string | Outfit;
  chapter: number | string;
  scene?: string;
  timestamp?: string;
  storyDate?: Date;
  notes?: string;
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category options
export const CLOTHING_CATEGORIES = [
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
] as const;

export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number];

// Common tag options
export const COMMON_TAGS = [
  'Formal',
  'Casual',
  'Battle',
  'Ceremonial',
  'Work',
  'Evening',
  'Day',
  'Royal',
  'Common',
  'Religious',
  'Military',
  'Athletic',
  'Sleepwear',
  'Outerwear',
  'Undergarment',
] as const;

// Season options
export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All'] as const;

// Character role options
export const CHARACTER_ROLES = [
  'Protagonist',
  'Antagonist',
  'Supporting',
  'Minor',
  'Background',
] as const;
