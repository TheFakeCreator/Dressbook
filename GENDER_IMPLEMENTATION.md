# Gender Field Implementation

## Overview
Added gender selection functionality to the clothing item system to categorize items by who typically wears them: Male, Female, or Unisex.

## Changes Made

### 1. Database Schema (`src/models/ClothingItem.ts`)
- Added `gender` field with enum values: `['Male', 'Female', 'Unisex']`
- Default value: `'Unisex'`
- Added index on gender field for query performance

### 2. TypeScript Types (`src/types/index.ts`)
- Added `gender?: 'Male' | 'Female' | 'Unisex'` to `ClothingItem` interface

### 3. Item Form (`src/components/forms/ItemForm.tsx`)
- Added gender to form state (default: 'Unisex')
- Added gender dropdown selector in UI after subcategory field
- Options: Unisex (default), Male, Female
- Helper text: "Select who typically wears this item"
- Gender included in form submission data

### 4. Search Page (`src/app/search/page.tsx`)
- Added `gender` filter state
- Added gender dropdown in filter sidebar
- Options: All Genders, Male, Female, Unisex
- Gender filter included in search API calls
- Gender added to filter dependencies (useCallback, useEffect)
- Gender included in `clearFilters()` and `hasActiveFilters` check

### 5. Search API (`src/app/api/search/route.ts`)
- Added `gender` query parameter parsing
- Gender filter applied to item search queries
- Exact match filtering: `itemFilter.gender = gender`

### 6. Item Detail Page (`src/app/items/[id]/page.tsx`)
- Display gender with purple badge styling
- Shows between materials and tags sections
- Label: "Gender:" with value in colored badge

### 7. AI Prompt Generator (`src/lib/aiPromptGenerator.ts`)
- Added gender information to item descriptions
- Includes gender-specific styling note for non-Unisex items
- Example: "This item is typically worn by female individuals - style and fit should reflect this"

### 8. Seed Data (`scripts/seedDatabase.ts`)
- All 28 base items updated with appropriate gender values:
  - **Female items (4)**: Blouse, Skirt, Leggings, Dress
  - **Male items (1)**: Necktie
  - **Unisex items (23)**: T-Shirt, Dress Shirt, Polo, Sweater, Hoodie, Tank Top, Jeans, Dress Pants, Shorts, Suit, Jumpsuit, Baseball Cap, Beanie, Sneakers, Dress Shoes, Boots, Sandals, Gloves, Scarf, Belt, Watch, Sunglasses, Backpack

## Gender Distribution in Seed Data

### Female (4 items)
- Blouse (Torso Upper)
- Dress (Full Body)
- Skirt (Torso Lower)
- Leggings (Legs)

### Male (1 item)
- Necktie (Neck)

### Unisex (23 items)
- Most modern clothing items are categorized as unisex
- Includes: casual wear, formal wear, outerwear, footwear, most accessories

## Usage

### Creating Items
1. Gender field appears after subcategory
2. Defaults to "Unisex"
3. Dropdown allows selection of Male, Female, or Unisex

### Filtering Items
1. Open filter sidebar on search page
2. Select gender filter: All Genders, Male, Female, or Unisex
3. Filter applies immediately with other active filters

### Viewing Items
- Gender displays as colored badge on item detail page
- Purple badge with gender value

### AI Image Generation
- Gender information included in AI prompts
- Helps generate appropriate styling and fit
- Non-Unisex items get specific gender styling notes

## Database Migration
The seed script has been re-run to add gender field to all existing items. If you have custom items in your database, they will default to 'Unisex' due to the schema default value.

## Future Enhancements
- Gender filter on main items list page
- Gender-specific outfit suggestions
- Gender statistics on analytics/dashboard
- Bulk update gender for multiple items
