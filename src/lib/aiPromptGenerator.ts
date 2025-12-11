import type { ClothingItem } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PromptCustomization {
  backgroundColor?: string;
  itemColor?: string;
  lighting?: string;
  cameraAngle?: string;
  style?: string;
  additionalDetails?: string;
}

const DEFAULT_CUSTOMIZATION: PromptCustomization = {
  backgroundColor: 'white',
  lighting: 'studio lighting',
  cameraAngle: 'front view',
  style: 'product photography',
};

/**
 * Generates a comprehensive JSON prompt for AI image generators
 * to create consistent clothing item images
 */
export function generateAIImagePrompt(
  item: Partial<ClothingItem>,
  parentItem?: ClothingItem,
  customization: PromptCustomization = {}
): object {
  const custom = { ...DEFAULT_CUSTOMIZATION, ...customization };
  
  // Base system prompt for consistency
  const systemPrompt = {
    objective: "Generate a highly detailed, photorealistic image of a clothing item for a wardrobe database",
    requirements: [
      "Professional product photography quality",
      "Centered composition with the item as the main focus",
      "Clean and simple background without distractions",
      "Consistent lighting and shadows",
      "High resolution and sharp details",
      "Accurate representation of textures and materials",
      "No human model unless specifically requested",
      "Item should be displayed flat lay or on a mannequin/hanger as appropriate"
    ],
    consistency_guidelines: [
      "Maintain uniform lighting across all generated images",
      "Use the same background color and style for the entire collection",
      "Keep the same camera angle and distance for similar items",
      "Ensure color accuracy and material representation",
      "Apply consistent post-processing and editing style"
    ],
    aspect_ratio: "1:1 (square)"
  };

  // Build item description from form data
  const itemDescription = buildItemDescription(item, parentItem);
  
  // Build visual specifications
  const visualSpecs = buildVisualSpecifications(item, custom);
  
  // Build material and texture details
  const materialDetails = buildMaterialDetails(item);
  
  // Build historical/cultural context if available
  const contextDetails = buildContextDetails(item);
  
  // Combine all parts into comprehensive prompt
  const prompt = {
    system_prompt: systemPrompt,
    item_details: {
      name: item.name || "Clothing Item",
      category: item.category || "General",
      subcategory: item.subcategory || null,
      description: item.description || null,
      ...itemDescription
    },
    visual_specifications: visualSpecs,
    material_and_texture: materialDetails,
    ...(Object.keys(contextDetails).length > 0 && { historical_cultural_context: contextDetails }),
    generation_parameters: {
      background: {
        color: custom.backgroundColor,
        style: "clean and minimal",
        texture: "smooth, no patterns"
      },
      lighting: {
        type: custom.lighting,
        direction: "soft, even illumination",
        shadows: "subtle and realistic",
        highlights: "natural specular reflections on appropriate materials"
      },
      camera: {
        angle: custom.cameraAngle,
        focal_length: "standard (50mm equivalent)",
        depth_of_field: "sharp focus on entire item, slight background blur"
      },
      style: {
        photography_type: custom.style,
        post_processing: "minimal, natural colors",
        resolution: "high resolution (2048x2048 or higher recommended)"
      }
    },
    ...(custom.additionalDetails && { additional_instructions: custom.additionalDetails }),
    output_format: {
      aspect_ratio: "1:1 (square) or 4:5 (portrait) preferred",
      file_format: "PNG or high-quality JPEG",
      color_space: "sRGB",
      dpi: "300 DPI for print quality"
    }
  };

  return prompt;
}

function buildItemDescription(
  item: Partial<ClothingItem>,
  parentItem?: ClothingItem
): object {
  const desc: any = {};

  // If this is a variation, reference parent item
  if (parentItem) {
    desc.base_item = {
      name: parentItem.name,
      category: parentItem.category,
      note: "This is a variation of the base item - maintain visual consistency with parent"
    };
  }

  // Add gender information
  if (item.gender) {
    desc.gender = item.gender;
    if (item.gender !== 'Unisex') {
      desc.gender_note = `This item is typically worn by ${item.gender.toLowerCase()} individuals - style and fit should reflect this`;
    }
  }

  // Add variation attributes if present
  if (item.variationAttributes) {
    const attrs = item.variationAttributes;
    const variations: string[] = [];
    
    if (attrs.sleeveType) variations.push(`Sleeve Type: ${attrs.sleeveType}`);
    if (attrs.neckline) variations.push(`Neckline: ${attrs.neckline}`);
    if (attrs.fit) variations.push(`Fit: ${attrs.fit}`);
    if (attrs.length) variations.push(`Length: ${attrs.length}`);
    if (attrs.closure) variations.push(`Closure: ${attrs.closure}`);
    if (attrs.pattern) variations.push(`Pattern: ${attrs.pattern}`);
    
    if (variations.length > 0) {
      desc.variation_details = variations;
      desc.variation_note = "These specific attributes must be clearly visible in the generated image";
    }
  }

  return desc;
}

function buildVisualSpecifications(
  item: Partial<ClothingItem>,
  custom: PromptCustomization
): object {
  const specs: any = {
    primary_focus: `A ${item.category || 'clothing'} item${item.subcategory ? ` (${item.subcategory})` : ''}`,
  };

  // Colors
  if (item.colors && item.colors.length > 0) {
    specs.colors = {
      specified: item.colors,
      note: "Use these exact colors or closest accurate representation"
    };
  } else if (custom.itemColor) {
    specs.colors = {
      specified: [custom.itemColor],
      note: "Primary color for the item"
    };
  }

  // Tags provide additional visual cues
  if (item.tags && item.tags.length > 0) {
    specs.style_tags = item.tags;
    specs.style_note = "Incorporate these style elements into the design";
  }

  return specs;
}

function buildMaterialDetails(item: Partial<ClothingItem>): object {
  const details: any = {};

  if (item.materials && item.materials.length > 0) {
    details.materials = item.materials;
    details.texture_requirements = [
      "Accurately represent the texture of each material",
      "Show realistic fabric drape and fold behavior",
      "Display appropriate sheen/matte finish for materials",
      "Capture the weight and body of the fabric"
    ];
    
    // Add material-specific rendering notes
    const materialNotes: string[] = [];
    item.materials.forEach(material => {
      const mat = material.toLowerCase();
      if (mat.includes('silk') || mat.includes('satin')) {
        materialNotes.push("High sheen, smooth texture with subtle highlights");
      } else if (mat.includes('cotton') || mat.includes('linen')) {
        materialNotes.push("Matte finish, visible weave texture, soft appearance");
      } else if (mat.includes('leather')) {
        materialNotes.push("Natural grain texture, moderate sheen, structured form");
      } else if (mat.includes('wool') || mat.includes('knit')) {
        materialNotes.push("Textured surface, visible knit pattern, soft and cozy appearance");
      } else if (mat.includes('denim')) {
        materialNotes.push("Visible diagonal twill weave, sturdy appearance, characteristic indigo fade");
      } else if (mat.includes('velvet')) {
        materialNotes.push("Rich pile texture, directional sheen, luxurious appearance");
      }
    });
    
    if (materialNotes.length > 0) {
      details.material_rendering_notes = materialNotes;
    }
  }

  return details;
}

function buildContextDetails(item: Partial<ClothingItem>): object {
  const context: any = {};

  if (item.realWorldReference) {
    const ref = item.realWorldReference;
    
    if (ref.historicalPeriod) {
      context.historical_period = ref.historicalPeriod;
    }
    
    if (ref.periodStart || ref.periodEnd) {
      context.time_period = {
        start: ref.periodStart,
        end: ref.periodEnd,
        note: "Design should reflect fashion characteristics of this era"
      };
    }
    
    if (ref.geographicOrigin) {
      context.geographic_origin = ref.geographicOrigin;
      context.cultural_note = "Incorporate authentic design elements from this region";
    }
    
    if (ref.culturalContext) {
      context.cultural_context = ref.culturalContext;
    }
    
    if (ref.historicalDescription) {
      context.historical_description = ref.historicalDescription;
      context.authenticity_note = "Use this description to ensure historical accuracy";
    }
    
    if (ref.referenceSources && ref.referenceSources.length > 0) {
      context.reference_sources = ref.referenceSources;
      context.research_note = "Base design on these historical references";
    }
    
    if (ref.accuracyNotes) {
      context.accuracy_considerations = ref.accuracyNotes;
    }
  }

  return context;
}

/**
 * Generates a simple, single-string prompt for quick use
 */
export function generateSimplePrompt(
  item: Partial<ClothingItem>,
  parentItem?: ClothingItem,
  customization: PromptCustomization = {}
): string {
  const custom = { ...DEFAULT_CUSTOMIZATION, ...customization };
  
  let prompt = `Professional product photography of a ${item.name || 'clothing item'}`;
  
  if (item.category) {
    prompt += `, ${item.category} category`;
  }
  
  // Add variation details
  if (item.variationAttributes) {
    const attrs = item.variationAttributes;
    const details: string[] = [];
    if (attrs.sleeveType) details.push(attrs.sleeveType);
    if (attrs.neckline) details.push(attrs.neckline);
    if (attrs.fit) details.push(attrs.fit);
    if (attrs.length) details.push(attrs.length);
    if (details.length > 0) {
      prompt += ` with ${details.join(', ')}`;
    }
  }
  
  // Add colors
  if (item.colors && item.colors.length > 0) {
    prompt += `, ${item.colors.join(' and ')} color`;
  } else if (custom.itemColor) {
    prompt += `, ${custom.itemColor} color`;
  }
  
  // Add materials
  if (item.materials && item.materials.length > 0) {
    prompt += `, made of ${item.materials.join(' and ')}`;
  }
  
  // Add description
  if (item.description) {
    prompt += `. ${item.description}`;
  }
  
  // Add visual settings
  prompt += `. ${custom.backgroundColor} background, ${custom.lighting}, ${custom.cameraAngle}`;
  prompt += `. High quality, sharp details, professional ${custom.style}`;
  
  // Add historical context if available
  if (item.realWorldReference?.historicalPeriod) {
    prompt += `. ${item.realWorldReference.historicalPeriod} style`;
  }
  
  if (item.realWorldReference?.geographicOrigin) {
    prompt += `, ${item.realWorldReference.geographicOrigin} origin`;
  }
  
  // Add parent reference for consistency
  if (parentItem) {
    prompt += `. Variation of ${parentItem.name}, maintain visual consistency`;
  }
  
  return prompt;
}

/**
 * Formats the JSON prompt for display with proper indentation
 */
export function formatPromptForDisplay(prompt: object): string {
  return JSON.stringify(prompt, null, 2);
}
