import mongoose from 'mongoose';
import dbConnect from '../src/lib/db';
import ClothingItemModel from '../src/models/ClothingItem';

const clothingItems = [
  // ===== TORSO UPPER =====
  {
    name: 'T-Shirt',
    category: 'Torso Upper',
    subcategory: 'Casual Top',
    description: 'Classic short-sleeved casual top, staple of modern wardrobes',
    tags: ['casual', 'everyday', 'comfortable', 'versatile'],
    colors: ['white', 'black', 'gray', 'navy'],
    materials: ['cotton', 'cotton blend'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1950,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Originally underwear, became casual outerwear in mid-20th century',
      historicalDescription: 'The T-shirt became popular in the 1950s after being worn by movie stars. Named after its T-shape.',
    },
  },
  {
    name: 'Dress Shirt',
    category: 'Torso Upper',
    subcategory: 'Formal Top',
    description: 'Formal button-up shirt with collar, typically worn with suits',
    tags: ['formal', 'business', 'professional', 'elegant'],
    colors: ['white', 'light blue', 'pink', 'striped'],
    materials: ['cotton', 'linen', 'silk blend'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1900,
      periodEnd: 2025,
      geographicOrigin: 'Europe',
      culturalContext: 'Worn by professionals, businesspeople, and for formal occasions',
      historicalDescription: 'Evolved from the white shirt of Victorian era, standardized in the 20th century',
    },
  },
  {
    name: 'Polo Shirt',
    category: 'Torso Upper',
    subcategory: 'Smart Casual',
    description: 'Collared shirt with a placket and two or three buttons',
    tags: ['smart casual', 'sports', 'preppy', 'comfortable'],
    colors: ['navy', 'white', 'black', 'burgundy'],
    materials: ['cotton pique', 'polyester blend'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1920,
      periodEnd: 2025,
      geographicOrigin: 'England',
      culturalContext: 'Originally for tennis and polo players, now smart casual wear',
      historicalDescription: 'Invented by tennis player René Lacoste in 1926',
    },
  },
  {
    name: 'Sweater',
    category: 'Torso Upper',
    subcategory: 'Knitwear',
    description: 'Knitted garment for warmth, covering torso and arms',
    tags: ['warm', 'cozy', 'winter', 'layering'],
    colors: ['gray', 'navy', 'burgundy', 'beige'],
    materials: ['wool', 'cashmere', 'acrylic', 'cotton'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1800,
      periodEnd: 2025,
      geographicOrigin: 'Scotland/Ireland',
      culturalContext: 'Originally worn by fishermen and sailors for warmth',
      historicalDescription: 'Traditional fishermen sweaters featured unique patterns identifying their village',
    },
  },
  {
    name: 'Hoodie',
    category: 'Torso Upper',
    subcategory: 'Casual Outerwear',
    description: 'Sweatshirt with an attached hood and often a front pocket',
    tags: ['casual', 'streetwear', 'comfortable', 'urban'],
    colors: ['black', 'gray', 'navy', 'burgundy'],
    materials: ['cotton fleece', 'polyester blend'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1930,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Originally workwear for cold warehouses, now streetwear staple',
      historicalDescription: 'Champion Products created the first hooded sweatshirt in the 1930s',
    },
  },
  {
    name: 'Blouse',
    category: 'Torso Upper',
    subcategory: 'Feminine Top',
    description: 'Loose-fitting upper garment, typically for women',
    tags: ['feminine', 'elegant', 'professional', 'versatile'],
    colors: ['white', 'cream', 'black', 'floral'],
    materials: ['silk', 'chiffon', 'cotton', 'polyester'],
    gender: 'Female',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1890,
      periodEnd: 2025,
      geographicOrigin: 'France',
      culturalContext: 'Professional and casual wear for women',
      historicalDescription: 'Emerged as women entered workforce in late 19th/early 20th century',
    },
  },
  {
    name: 'Tank Top',
    category: 'Torso Upper',
    subcategory: 'Sleeveless Top',
    description: 'Sleeveless shirt with large armholes and no collar',
    tags: ['casual', 'summer', 'athletic', 'layering'],
    colors: ['white', 'black', 'gray', 'colors'],
    materials: ['cotton', 'cotton blend', 'athletic fabric'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1920,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Athletic wear, underwear, or casual summer clothing',
      historicalDescription: 'Named after tank suits worn in swimming pools (tanks)',
    },
  },

  // ===== TORSO LOWER =====
  {
    name: 'Jeans',
    category: 'Torso Lower',
    subcategory: 'Casual Pants',
    description: 'Durable denim pants, originally workwear',
    tags: ['casual', 'durable', 'versatile', 'classic'],
    colors: ['blue', 'black', 'light wash', 'dark wash'],
    materials: ['denim', 'cotton'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1873,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Originally workwear for miners, now universal casual wear',
      historicalDescription: 'Invented by Levi Strauss and Jacob Davis with riveted pockets for durability',
    },
  },
  {
    name: 'Dress Pants',
    category: 'Torso Lower',
    subcategory: 'Formal Pants',
    description: 'Formal trousers typically worn for business or dressy occasions',
    tags: ['formal', 'business', 'professional', 'tailored'],
    colors: ['black', 'navy', 'gray', 'charcoal'],
    materials: ['wool', 'polyester blend', 'cotton blend'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1800,
      periodEnd: 2025,
      geographicOrigin: 'Europe',
      culturalContext: 'Professional business wear and formal occasions',
      historicalDescription: 'Evolved from breeches in 19th century, standardized as business wear',
    },
  },
  {
    name: 'Shorts',
    category: 'Torso Lower',
    subcategory: 'Casual Bottom',
    description: 'Pants that end above the knee',
    tags: ['casual', 'summer', 'comfortable', 'athletic'],
    colors: ['khaki', 'navy', 'black', 'denim'],
    materials: ['cotton', 'polyester', 'denim'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1900,
      periodEnd: 2025,
      geographicOrigin: 'Global',
      culturalContext: 'Casual wear, athletic wear, warm weather clothing',
      historicalDescription: 'Became acceptable casual wear in Western countries after WWII',
    },
  },
  {
    name: 'Skirt',
    category: 'Torso Lower',
    subcategory: 'Bottom',
    description: 'Garment hanging from waist, typically worn by women',
    tags: ['feminine', 'versatile', 'elegant', 'classic'],
    colors: ['black', 'navy', 'gray', 'patterns'],
    materials: ['cotton', 'wool', 'silk', 'polyester'],
    gender: 'Female',
    realWorldReference: {
      historicalPeriod: 'Ancient to Modern',
      periodStart: -3000,
      periodEnd: 2025,
      geographicOrigin: 'Global',
      culturalContext: 'Worn across cultures and time periods, formal and casual',
      historicalDescription: 'One of the oldest garments, worn by all genders historically',
    },
  },
  {
    name: 'Leggings',
    category: 'Legs',
    subcategory: 'Tight Bottom',
    description: 'Form-fitting stretchy pants',
    tags: ['athletic', 'casual', 'comfortable', 'stretchy'],
    colors: ['black', 'gray', 'navy', 'patterns'],
    materials: ['spandex', 'lycra', 'polyester blend'],
    gender: 'Female',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1960,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Athletic wear and casual everyday wear',
      historicalDescription: 'Popularized in the 1960s as part of fitness fashion trend',
    },
  },

  // ===== FULL BODY =====
  {
    name: 'Dress',
    category: 'Full Body',
    subcategory: 'One-piece',
    description: 'One-piece garment covering body and extending down over legs',
    tags: ['feminine', 'elegant', 'versatile', 'formal'],
    colors: ['black', 'red', 'navy', 'floral'],
    materials: ['cotton', 'silk', 'chiffon', 'polyester'],
    gender: 'Female',
    realWorldReference: {
      historicalPeriod: 'Ancient to Modern',
      periodStart: -3000,
      periodEnd: 2025,
      geographicOrigin: 'Global',
      culturalContext: 'Ranges from casual day wear to formal evening wear',
      historicalDescription: 'One of the most versatile and enduring garment types',
    },
  },
  {
    name: 'Suit',
    category: 'Full Body',
    subcategory: 'Formal Ensemble',
    description: 'Matching jacket and trousers, formal business attire',
    tags: ['formal', 'business', 'professional', 'elegant'],
    colors: ['navy', 'charcoal', 'black', 'gray'],
    materials: ['wool', 'wool blend', 'linen'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1850,
      periodEnd: 2025,
      geographicOrigin: 'England',
      culturalContext: 'Standard business and formal wear for men',
      historicalDescription: 'Evolved from riding coats in 19th century England, standardized by Savile Row tailors',
    },
  },
  {
    name: 'Jumpsuit',
    category: 'Full Body',
    subcategory: 'One-piece',
    description: 'One-piece garment covering torso and legs',
    tags: ['trendy', 'casual', 'versatile', 'modern'],
    colors: ['black', 'navy', 'olive', 'denim'],
    materials: ['cotton', 'linen', 'denim', 'polyester'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1930,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Originally workwear for parachuters and mechanics, now fashion item',
      historicalDescription: 'Became fashion item in 1960s-70s, continues in modern fashion',
    },
  },

  // ===== HEAD =====
  {
    name: 'Baseball Cap',
    category: 'Head',
    subcategory: 'Casual Hat',
    description: 'Soft cap with rounded crown and stiff bill',
    tags: ['casual', 'sporty', 'streetwear', 'sun protection'],
    colors: ['black', 'navy', 'white', 'team colors'],
    materials: ['cotton', 'polyester', 'wool blend'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1860,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Sports teams, casual wear, streetwear culture',
      historicalDescription: 'Originated with Brooklyn Excelsiors baseball team in 1860',
    },
  },
  {
    name: 'Beanie',
    category: 'Head',
    subcategory: 'Winter Hat',
    description: 'Knitted cap that fits snugly on head',
    tags: ['winter', 'warm', 'casual', 'cozy'],
    colors: ['black', 'gray', 'navy', 'burgundy'],
    materials: ['wool', 'acrylic', 'cotton blend'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1900,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Cold weather protection, casual fashion',
      historicalDescription: 'Working-class headwear that became mainstream fashion item',
    },
  },

  // ===== FEET =====
  {
    name: 'Sneakers',
    category: 'Feet',
    subcategory: 'Athletic Shoes',
    description: 'Casual athletic shoes with rubber soles',
    tags: ['casual', 'athletic', 'comfortable', 'versatile'],
    colors: ['white', 'black', 'multicolor', 'various'],
    materials: ['canvas', 'leather', 'synthetic', 'rubber'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1917,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Athletic wear, casual everyday shoes, streetwear culture',
      historicalDescription: 'Keds introduced first mass-marketed canvas-top sneakers in 1917',
    },
  },
  {
    name: 'Dress Shoes',
    category: 'Feet',
    subcategory: 'Formal Shoes',
    description: 'Formal leather shoes for business and dressy occasions',
    tags: ['formal', 'business', 'professional', 'classic'],
    colors: ['black', 'brown', 'burgundy', 'tan'],
    materials: ['leather', 'patent leather'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1800,
      periodEnd: 2025,
      geographicOrigin: 'Europe',
      culturalContext: 'Business attire, formal occasions, professional settings',
      historicalDescription: 'Oxford and Derby styles standardized in 19th century',
    },
  },
  {
    name: 'Boots',
    category: 'Feet',
    subcategory: 'Footwear',
    description: 'Footwear covering foot and ankle or higher',
    tags: ['durable', 'weather', 'versatile', 'rugged'],
    colors: ['black', 'brown', 'tan', 'gray'],
    materials: ['leather', 'suede', 'rubber'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Ancient to Modern',
      periodStart: -1000,
      periodEnd: 2025,
      geographicOrigin: 'Global',
      culturalContext: 'Work, weather protection, fashion, military',
      historicalDescription: 'One of the oldest shoe types, essential for protection and durability',
    },
  },
  {
    name: 'Sandals',
    category: 'Feet',
    subcategory: 'Open Footwear',
    description: 'Open-toed footwear with straps',
    tags: ['casual', 'summer', 'comfortable', 'breathable'],
    colors: ['brown', 'black', 'tan', 'natural'],
    materials: ['leather', 'rubber', 'synthetic'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Ancient to Modern',
      periodStart: -10000,
      periodEnd: 2025,
      geographicOrigin: 'Global',
      culturalContext: 'Warm weather footwear across all cultures',
      historicalDescription: 'Among the oldest shoe types, worn in ancient civilizations',
    },
  },

  // ===== HANDS =====
  {
    name: 'Gloves',
    category: 'Hands',
    subcategory: 'Hand Covering',
    description: 'Covering for hands with separate sections for fingers',
    tags: ['winter', 'warm', 'formal', 'protective'],
    colors: ['black', 'brown', 'gray', 'leather'],
    materials: ['leather', 'wool', 'cotton', 'synthetic'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Ancient to Modern',
      periodStart: -1000,
      periodEnd: 2025,
      geographicOrigin: 'Global',
      culturalContext: 'Protection, warmth, fashion, formal wear',
      historicalDescription: 'Used for protection, status symbol, and fashion throughout history',
    },
  },

  // ===== NECK =====
  {
    name: 'Necktie',
    category: 'Neck',
    subcategory: 'Formal Accessory',
    description: 'Long piece of cloth worn around neck, typically with formal wear',
    tags: ['formal', 'business', 'professional', 'classic'],
    colors: ['navy', 'burgundy', 'black', 'patterns'],
    materials: ['silk', 'polyester', 'wool'],
    gender: 'Male',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1660,
      periodEnd: 2025,
      geographicOrigin: 'Croatia/France',
      culturalContext: 'Business attire, formal occasions, professional dress',
      historicalDescription: 'Evolved from Croatian mercenaries cravats during Thirty Years War',
    },
  },
  {
    name: 'Scarf',
    category: 'Neck',
    subcategory: 'Accessory',
    description: 'Piece of fabric worn around neck for warmth or fashion',
    tags: ['winter', 'warm', 'accessory', 'versatile'],
    colors: ['various', 'patterns', 'solid colors'],
    materials: ['wool', 'cashmere', 'silk', 'cotton'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Ancient to Modern',
      periodStart: -3000,
      periodEnd: 2025,
      geographicOrigin: 'Global',
      culturalContext: 'Fashion accessory, warmth, cultural significance',
      historicalDescription: 'Ancient garment with both practical and decorative purposes',
    },
  },

  // ===== ACCESSORIES =====
  {
    name: 'Belt',
    category: 'Accessories',
    subcategory: 'Waist Accessory',
    description: 'Flexible band worn around waist',
    tags: ['functional', 'fashion', 'classic', 'essential'],
    colors: ['black', 'brown', 'tan', 'leather'],
    materials: ['leather', 'fabric', 'synthetic'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Ancient to Modern',
      periodStart: -3000,
      periodEnd: 2025,
      geographicOrigin: 'Global',
      culturalContext: 'Functional (hold pants) and decorative',
      historicalDescription: 'One of the oldest accessories, essential throughout history',
    },
  },
  {
    name: 'Watch',
    category: 'Accessories',
    subcategory: 'Jewelry',
    description: 'Timepiece worn on wrist',
    tags: ['functional', 'jewelry', 'professional', 'classic'],
    colors: ['silver', 'gold', 'black', 'various'],
    materials: ['metal', 'leather', 'rubber', 'plastic'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1868,
      periodEnd: 2025,
      geographicOrigin: 'Switzerland',
      culturalContext: 'Timekeeping, fashion statement, status symbol',
      historicalDescription: 'Wristwatch popularized in early 20th century, became fashion staple',
    },
  },
  {
    name: 'Sunglasses',
    category: 'Face',
    subcategory: 'Eyewear',
    description: 'Tinted glasses protecting eyes from sun',
    tags: ['functional', 'fashion', 'protection', 'cool'],
    colors: ['black', 'tortoise', 'aviator', 'various'],
    materials: ['plastic', 'metal', 'acetate'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1929,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'Sun protection, fashion statement, celebrity culture',
      historicalDescription: 'Foster Grant mass-produced sunglasses in 1929, Ray-Ban Aviators in 1936',
    },
  },
  {
    name: 'Backpack',
    category: 'Accessories',
    subcategory: 'Bag',
    description: 'Bag carried on back with two shoulder straps',
    tags: ['functional', 'practical', 'casual', 'storage'],
    colors: ['black', 'gray', 'navy', 'various'],
    materials: ['nylon', 'polyester', 'canvas', 'leather'],
    gender: 'Unisex',
    realWorldReference: {
      historicalPeriod: 'Modern Era',
      periodStart: 1938,
      periodEnd: 2025,
      geographicOrigin: 'United States',
      culturalContext: 'School, work, travel, outdoor activities',
      historicalDescription: 'Modern backpack with zippered compartments invented by Gerry Cunningham in 1938',
    },
  },
];

// Variations to create (will reference parent items after they're created)
const variations = [
  // T-Shirt Variations
  {
    parentName: 'T-Shirt',
    name: 'V-Neck T-Shirt',
    variationAttributes: { neckline: 'V-Neck' },
    description: 'T-shirt with V-shaped neckline, more stylish than crew neck',
  },
  {
    parentName: 'T-Shirt',
    name: 'Long Sleeve T-Shirt',
    variationAttributes: { sleeveType: 'Long Sleeve' },
    description: 'T-shirt with full-length sleeves for cooler weather',
  },
  {
    parentName: 'T-Shirt',
    name: 'Henley Shirt',
    variationAttributes: { neckline: 'Henley', closure: 'Button Placket' },
    description: 'T-shirt with collarless button placket',
  },
  {
    parentName: 'T-Shirt',
    name: 'Pocket T-Shirt',
    variationAttributes: { pattern: 'Pocket Detail' },
    description: 'T-shirt with chest pocket',
  },

  // Jeans Variations
  {
    parentName: 'Jeans',
    name: 'Slim Fit Jeans',
    variationAttributes: { fit: 'Slim Fit' },
    description: 'Fitted jeans that taper from hip to ankle',
  },
  {
    parentName: 'Jeans',
    name: 'Bootcut Jeans',
    variationAttributes: { fit: 'Bootcut', length: 'Full Length' },
    description: 'Jeans that flare slightly at the bottom to fit over boots',
  },
  {
    parentName: 'Jeans',
    name: 'Skinny Jeans',
    variationAttributes: { fit: 'Skinny' },
    description: 'Very fitted jeans that hug the legs',
  },
  {
    parentName: 'Jeans',
    name: 'Straight Leg Jeans',
    variationAttributes: { fit: 'Straight' },
    description: 'Classic jeans with consistent width from hip to ankle',
  },
  {
    parentName: 'Jeans',
    name: 'High-Waisted Jeans',
    variationAttributes: { fit: 'High-Waisted' },
    description: 'Jeans with waistline above natural waist',
  },

  // Sweater Variations
  {
    parentName: 'Sweater',
    name: 'Crewneck Sweater',
    variationAttributes: { neckline: 'Crew Neck' },
    description: 'Classic sweater with round neckline',
  },
  {
    parentName: 'Sweater',
    name: 'V-Neck Sweater',
    variationAttributes: { neckline: 'V-Neck' },
    description: 'Sweater with V-shaped neckline',
  },
  {
    parentName: 'Sweater',
    name: 'Cardigan',
    variationAttributes: { closure: 'Button-Down', pattern: 'Open Front' },
    description: 'Sweater that opens in front with buttons',
  },
  {
    parentName: 'Sweater',
    name: 'Turtleneck Sweater',
    variationAttributes: { neckline: 'Turtleneck' },
    description: 'Sweater with high folded collar covering neck',
  },

  // Dress Shirt Variations
  {
    parentName: 'Dress Shirt',
    name: 'French Cuff Dress Shirt',
    variationAttributes: { closure: 'French Cuff', pattern: 'Formal' },
    description: 'Formal dress shirt with double cuffs requiring cufflinks',
  },
  {
    parentName: 'Dress Shirt',
    name: 'Oxford Shirt',
    variationAttributes: { pattern: 'Oxford Weave' },
    description: 'Dress shirt with textured oxford cloth fabric',
  },

  // Dress Variations
  {
    parentName: 'Dress',
    name: 'A-Line Dress',
    variationAttributes: { fit: 'A-Line' },
    description: 'Dress fitted at top, flaring out gradually like letter A',
  },
  {
    parentName: 'Dress',
    name: 'Maxi Dress',
    variationAttributes: { length: 'Maxi' },
    description: 'Full-length dress reaching ankles or floor',
  },
  {
    parentName: 'Dress',
    name: 'Mini Dress',
    variationAttributes: { length: 'Mini' },
    description: 'Short dress ending above the knee',
  },
  {
    parentName: 'Dress',
    name: 'Bodycon Dress',
    variationAttributes: { fit: 'Bodycon' },
    description: 'Tight-fitting dress that hugs body contours',
  },
  {
    parentName: 'Dress',
    name: 'Wrap Dress',
    variationAttributes: { closure: 'Wrap', pattern: 'Wrap Style' },
    description: 'Dress that wraps around body and ties at waist',
  },

  // Skirt Variations
  {
    parentName: 'Skirt',
    name: 'Pencil Skirt',
    variationAttributes: { fit: 'Pencil', length: 'Knee-Length' },
    description: 'Slim-fitting skirt, typically knee-length',
  },
  {
    parentName: 'Skirt',
    name: 'A-Line Skirt',
    variationAttributes: { fit: 'A-Line' },
    description: 'Skirt that flares out from waist in A-shape',
  },
  {
    parentName: 'Skirt',
    name: 'Mini Skirt',
    variationAttributes: { length: 'Mini' },
    description: 'Short skirt ending well above knee',
  },
  {
    parentName: 'Skirt',
    name: 'Maxi Skirt',
    variationAttributes: { length: 'Maxi' },
    description: 'Full-length skirt reaching ankles',
  },

  // Shorts Variations
  {
    parentName: 'Shorts',
    name: 'Cargo Shorts',
    variationAttributes: { pattern: 'Cargo Pockets' },
    description: 'Shorts with multiple large pockets on sides',
  },
  {
    parentName: 'Shorts',
    name: 'Athletic Shorts',
    variationAttributes: { pattern: 'Athletic' },
    description: 'Loose, breathable shorts for sports and exercise',
  },
  {
    parentName: 'Shorts',
    name: 'Bermuda Shorts',
    variationAttributes: { length: 'Bermuda' },
    description: 'Shorts that reach just above the knee',
  },
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();

    console.log('🗑️  Clearing existing items...');
    await ClothingItemModel.deleteMany({});

    console.log('📦 Creating base clothing items...');
    const createdItems = await ClothingItemModel.insertMany(clothingItems);
    console.log(`✅ Created ${createdItems.length} base items`);

    // Create a map of item names to IDs for variation creation
    const itemMap = new Map();
    createdItems.forEach(item => {
      itemMap.set(item.name, item._id);
    });

    console.log('🔄 Creating variations...');
    const variationPromises = variations.map(async (variation) => {
      const parentId = itemMap.get(variation.parentName);
      if (!parentId) {
        console.warn(`⚠️  Parent item "${variation.parentName}" not found for variation "${variation.name}"`);
        return null;
      }

      const parent = createdItems.find(item => item.name === variation.parentName);
      if (!parent) return null;

      const variationItem = {
        name: variation.name,
        category: parent.category,
        subcategory: parent.subcategory,
        description: variation.description,
        tags: parent.tags,
        colors: parent.colors,
        materials: parent.materials,
        realWorldReference: parent.realWorldReference,
        parentItem: parentId,
        baseItemId: parentId,
        variationAttributes: variation.variationAttributes,
      };

      return ClothingItemModel.create(variationItem);
    });

    const createdVariations = await Promise.all(variationPromises);
    const successfulVariations = createdVariations.filter(v => v !== null);
    console.log(`✅ Created ${successfulVariations.length} variations`);

    console.log('\n📊 Database Seeding Summary:');
    console.log(`   • Base Items: ${createdItems.length}`);
    console.log(`   • Variations: ${successfulVariations.length}`);
    console.log(`   • Total: ${createdItems.length + successfulVariations.length} items`);
    
    console.log('\n📋 Items by Category:');
    const categories = [...new Set(createdItems.map(item => item.category))];
    categories.forEach(category => {
      const count = createdItems.filter(item => item.category === category).length;
      console.log(`   • ${category}: ${count} items`);
    });

    console.log('\n✨ Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeder
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
