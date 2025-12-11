'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ClothingItem, ImageData } from '@/types';
import { generateAIImagePrompt, generateSimplePrompt, formatPromptForDisplay, type PromptCustomization } from '@/lib/aiPromptGenerator';

interface ItemFormProps {
  initialData?: ClothingItem;
  onSubmit: (data: Partial<ClothingItem>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
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
];

export function ItemForm({ initialData, onSubmit, onCancel, isLoading }: ItemFormProps) {
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>(initialData?.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [availableItems, setAvailableItems] = useState<ClothingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // Log initial data for debugging
  useEffect(() => {
    if (initialData) {
      console.log('ItemForm initialized with data:', {
        name: initialData.name,
        parentItem: initialData.parentItem,
        parentItemType: typeof initialData.parentItem,
        parentItemId: typeof initialData.parentItem === 'string' 
          ? initialData.parentItem 
          : initialData.parentItem?._id,
      });
    }
  }, [initialData]);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    description: initialData?.description || '',
    tags: initialData?.tags?.join(', ') || '',
    colors: initialData?.colors?.join(', ') || '',
    materials: initialData?.materials?.join(', ') || '',
    gender: initialData?.gender || 'Unisex',
    // Real-world reference fields
    historicalPeriod: initialData?.realWorldReference?.historicalPeriod || '',
    periodStart: initialData?.realWorldReference?.periodStart?.toString() || '',
    periodEnd: initialData?.realWorldReference?.periodEnd?.toString() || '',
    geographicOrigin: initialData?.realWorldReference?.geographicOrigin || '',
    culturalContext: initialData?.realWorldReference?.culturalContext || '',
    historicalDescription: initialData?.realWorldReference?.historicalDescription || '',
    referenceSources: initialData?.realWorldReference?.referenceSources?.join('\n') || '',
    accuracyNotes: initialData?.realWorldReference?.accuracyNotes || '',
    // Variation fields
    parentItemId: (typeof initialData?.parentItem === 'string' ? initialData.parentItem : initialData?.parentItem?._id) || '',
    sleeveType: initialData?.variationAttributes?.sleeveType || '',
    neckline: initialData?.variationAttributes?.neckline || '',
    fit: initialData?.variationAttributes?.fit || '',
    length: initialData?.variationAttributes?.length || '',
    closure: initialData?.variationAttributes?.closure || '',
    pattern: initialData?.variationAttributes?.pattern || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // AI Prompt Generation state
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptFormat, setPromptFormat] = useState<'json' | 'simple'>('json');
  const [promptCustomization, setPromptCustomization] = useState<PromptCustomization>({
    backgroundColor: 'white',
    itemColor: '',
    lighting: 'studio lighting',
    cameraAngle: 'front view',
    style: 'product photography',
    additionalDetails: '',
  });
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Fetch available items for parent item selector
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const response = await fetch('/api/items?limit=1000&includeVariations=true');
        if (response.ok) {
          const result = await response.json();
          const items = result.data || [];
          // Exclude the current item from the list if editing
          const filteredItems = initialData?._id 
            ? items.filter((item: ClothingItem) => item._id !== initialData._id)
            : items;
          setAvailableItems(filteredItems);
          console.log('Available items for parent selector:', filteredItems.length);
          console.log('Current formData.parentItemId:', formData.parentItemId);
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
        setAvailableItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [initialData?._id, formData.parentItemId]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Add uploaded image to the list
      const newImage: ImageData = {
        url: result.data.url,
        thumbnail: result.data.sizes.thumbnail,
        isPrimary: uploadedImages.length === 0, // First image is primary
        width: result.data.metadata.width,
        height: result.data.metadata.height,
      };

      setUploadedImages(prev => [...prev, newImage]);
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePromptCustomizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPromptCustomization(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneratePrompt = () => {
    // Build current item data from form
    const currentItemData: Partial<ClothingItem> = {
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
      materials: formData.materials ? formData.materials.split(',').map(m => m.trim()) : [],
      variationAttributes: {
        sleeveType: formData.sleeveType,
        neckline: formData.neckline,
        fit: formData.fit,
        length: formData.length,
        closure: formData.closure,
        pattern: formData.pattern,
      },
      realWorldReference: {
        historicalPeriod: formData.historicalPeriod,
        periodStart: formData.periodStart ? Number(formData.periodStart) : undefined,
        periodEnd: formData.periodEnd ? Number(formData.periodEnd) : undefined,
        geographicOrigin: formData.geographicOrigin,
        culturalContext: formData.culturalContext,
        historicalDescription: formData.historicalDescription,
        referenceSources: formData.referenceSources ? formData.referenceSources.split('\n').filter(Boolean) : [],
        accuracyNotes: formData.accuracyNotes,
      },
    };

    // Find parent item if selected
    const parentItem = formData.parentItemId 
      ? availableItems.find(item => item._id === formData.parentItemId)
      : undefined;

    // Generate prompt based on selected format
    let prompt: string;
    if (promptFormat === 'json') {
      const jsonPrompt = generateAIImagePrompt(currentItemData, parentItem, promptCustomization);
      prompt = formatPromptForDisplay(jsonPrompt);
    } else {
      prompt = generateSimplePrompt(currentItemData, parentItem, promptCustomization);
    }

    setGeneratedPrompt(prompt);
    setShowAIPrompt(true);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Validate year ranges if provided
    if (formData.periodStart && isNaN(Number(formData.periodStart))) {
      newErrors.periodStart = 'Must be a valid year';
    }

    if (formData.periodEnd && isNaN(Number(formData.periodEnd))) {
      newErrors.periodEnd = 'Must be a valid year';
    }

    if (formData.periodStart && formData.periodEnd) {
      const start = Number(formData.periodStart);
      const end = Number(formData.periodEnd);
      if (start > end) {
        newErrors.periodEnd = 'End year must be after start year';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: Partial<ClothingItem> = {
      name: formData.name.trim(),
      category: formData.category,
      subcategory: formData.subcategory.trim() || undefined,
      description: formData.description.trim() || undefined,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      materials: formData.materials ? formData.materials.split(',').map(m => m.trim()).filter(Boolean) : [],
      gender: formData.gender as 'Male' | 'Female' | 'Unisex',
      images: uploadedImages,
      realWorldReference: {
        historicalPeriod: formData.historicalPeriod.trim() || undefined,
        periodStart: formData.periodStart ? Number(formData.periodStart) : undefined,
        periodEnd: formData.periodEnd ? Number(formData.periodEnd) : undefined,
        geographicOrigin: formData.geographicOrigin.trim() || undefined,
        culturalContext: formData.culturalContext.trim() || undefined,
        historicalDescription: formData.historicalDescription.trim() || undefined,
        referenceSources: formData.referenceSources 
          ? formData.referenceSources.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        accuracyNotes: formData.accuracyNotes.trim() || undefined,
      },
      // Variation data
      parentItem: formData.parentItemId || undefined,
      variationAttributes: {
        ...(formData.sleeveType && { sleeveType: formData.sleeveType }),
        ...(formData.neckline && { neckline: formData.neckline }),
        ...(formData.fit && { fit: formData.fit }),
        ...(formData.length && { length: formData.length }),
        ...(formData.closure && { closure: formData.closure }),
        ...(formData.pattern && { pattern: formData.pattern }),
      },
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-black">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Victorian Top Hat"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-900 mb-1">
              Subcategory
            </label>
            <Input
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="e.g., Formal Hat, Evening Wear"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-900 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="Unisex">Unisex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select who typically wears this item
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the clothing item..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-900">
                Tags
              </label>
              <Tooltip content="Tags help organize and find items. Use descriptive keywords like 'formal', 'vintage', 'summer', etc.">
                <span className="text-gray-400 hover:text-gray-600 cursor-help text-sm">ⓘ</span>
              </Tooltip>
            </div>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="formal, elegant, vintage (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="colors" className="block text-sm font-medium text-gray-900 mb-1">
                Colors
              </label>
              <Input
                id="colors"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                placeholder="black, navy, burgundy"
              />
            </div>

            <div>
              <label htmlFor="materials" className="block text-sm font-medium text-gray-900 mb-1">
                Materials
              </label>
              <Input
                id="materials"
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                placeholder="silk, felt, leather"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Images */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-black">Images</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload reference images for this clothing item. The first image will be used as the primary image.
        </p>

        <div className="space-y-4">
          {/* Uploaded images preview */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={image.thumbnail || image.url}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                        Primary
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={uploadingImage}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload component */}
          <ImageUpload
            onUpload={handleImageUpload}
            disabled={uploadingImage || isLoading}
          />

          <p className="text-xs text-gray-500">
            Tip: Images are automatically optimized and resized for web display.
          </p>
        </div>
      </Card>

      {/* Real-World Reference */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-black">Real-World Historical Reference</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add historical context for this clothing item from real-world history.
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="historicalPeriod" className="block text-sm font-medium text-gray-900">
                Historical Period
              </label>
              <Tooltip content="Specify when this clothing style was worn in real history. This helps establish authenticity and context for your wardrobe.">
                <span className="text-gray-400 hover:text-gray-600 cursor-help text-sm">ⓘ</span>
              </Tooltip>
            </div>
            <Input
              id="historicalPeriod"
              name="historicalPeriod"
              value={formData.historicalPeriod}
              onChange={handleChange}
              placeholder="e.g., Victorian Era, 1840-1900, Medieval Period"
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: &quot;Victorian Era&quot;, &quot;1920s&quot;, &quot;Renaissance&quot;, &quot;Ancient Rome&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="periodStart" className="block text-sm font-medium text-gray-900 mb-1">
                Period Start Year
              </label>
              <Input
                id="periodStart"
                name="periodStart"
                type="number"
                value={formData.periodStart}
                onChange={handleChange}
                placeholder="1840"
                className={errors.periodStart ? 'border-red-500' : ''}
              />
              {errors.periodStart && <p className="text-sm text-red-500 mt-1">{errors.periodStart}</p>}
            </div>

            <div>
              <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-900 mb-1">
                Period End Year
              </label>
              <Input
                id="periodEnd"
                name="periodEnd"
                type="number"
                value={formData.periodEnd}
                onChange={handleChange}
                placeholder="1900"
                className={errors.periodEnd ? 'border-red-500' : ''}
              />
              {errors.periodEnd && <p className="text-sm text-red-500 mt-1">{errors.periodEnd}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="geographicOrigin" className="block text-sm font-medium text-gray-900 mb-1">
              Geographic Origin
            </label>
            <Input
              id="geographicOrigin"
              name="geographicOrigin"
              value={formData.geographicOrigin}
              onChange={handleChange}
              placeholder="e.g., Victorian England, Feudal Japan, Ancient Egypt"
            />
          </div>

          <div>
            <label htmlFor="culturalContext" className="block text-sm font-medium text-gray-900 mb-1">
              Cultural Context
            </label>
            <textarea
              id="culturalContext"
              name="culturalContext"
              value={formData.culturalContext}
              onChange={handleChange}
              rows={2}
              placeholder="Who wore this? In what social context?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: &quot;Worn by upper-class men for formal occasions and business&quot;
            </p>
          </div>

          <div>
            <label htmlFor="historicalDescription" className="block text-sm font-medium text-gray-900 mb-1">
              Historical Description
            </label>
            <textarea
              id="historicalDescription"
              name="historicalDescription"
              value={formData.historicalDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Historical details about this garment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label htmlFor="referenceSources" className="block text-sm font-medium text-gray-900 mb-1">
              Reference Sources
            </label>
            <textarea
              id="referenceSources"
              name="referenceSources"
              value={formData.referenceSources}
              onChange={handleChange}
              rows={3}
              placeholder="https://fashionhistory.org/victorian-hats&#10;Museum of Fashion, London&#10;Book: Victorian Costume by Author Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm text-gray-900 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              One source per line. Can be URLs, books, museums, etc.
            </p>
          </div>

          <div>
            <label htmlFor="accuracyNotes" className="block text-sm font-medium text-gray-900 mb-1">
              Accuracy Notes
            </label>
            <textarea
              id="accuracyNotes"
              name="accuracyNotes"
              value={formData.accuracyNotes}
              onChange={handleChange}
              rows={2}
              placeholder="Any notes about historical accuracy or variations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </Card>

      {/* Variations */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-black">Clothing Variations</h3>
        <p className="text-sm text-gray-600 mb-4">
          Define variation attributes for this item (e.g., sleeve type, fit, neckline). Optionally link to a parent item to create a variation hierarchy.
        </p>

        <div className="space-y-4">
          {/* Parent Item Selector */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="parentItemId" className="block text-sm font-medium text-gray-900">
                Parent Item (Optional)
              </label>
              <Tooltip content="Create variations by selecting a parent item. For example, 'Turtle Neck T-shirt' can be a variation of 'T-shirt'.">
                <span className="text-gray-400 hover:text-gray-600 cursor-help text-sm">ⓘ</span>
              </Tooltip>
            </div>
            <select
              id="parentItemId"
              name="parentItemId"
              value={formData.parentItemId}
              onChange={handleChange}
              disabled={loadingItems}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">None - This is a base item</option>
              {loadingItems ? (
                <option disabled>Loading items...</option>
              ) : availableItems.length === 0 ? (
                <option disabled>No items available yet</option>
              ) : (
                availableItems.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} — {item.category}{item.subcategory ? ` • ${item.subcategory}` : ''}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {loadingItems 
                ? 'Loading available items...'
                : availableItems.length === 0
                ? 'Create some base items first, then you can create variations'
                : `${availableItems.length} item${availableItems.length === 1 ? '' : 's'} available. Select a parent item if this is a variation (e.g., select "T-shirt" for "Turtle Neck T-shirt")`
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{/* Sleeve Type field */}
            <div>
              <label htmlFor="sleeveType" className="block text-sm font-medium text-gray-900 mb-1">
                Sleeve Type
              </label>
              <Input
                id="sleeveType"
                name="sleeveType"
                value={formData.sleeveType}
                onChange={handleChange}
                placeholder="e.g., Full Sleeve, Half Sleeve, Sleeveless"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: Full Sleeve, Half Sleeve, 3/4 Sleeve, Sleeveless, Cap Sleeve
              </p>
            </div>

            <div>
              <label htmlFor="neckline" className="block text-sm font-medium text-gray-900 mb-1">
                Neckline
              </label>
              <Input
                id="neckline"
                name="neckline"
                value={formData.neckline}
                onChange={handleChange}
                placeholder="e.g., Turtle Neck, V-Neck, Round Neck"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: Turtle Neck, V-Neck, Round Neck, Crew Neck, Scoop Neck
              </p>
            </div>

            <div>
              <label htmlFor="fit" className="block text-sm font-medium text-gray-900 mb-1">
                Fit
              </label>
              <Input
                id="fit"
                name="fit"
                value={formData.fit}
                onChange={handleChange}
                placeholder="e.g., Oversized, Slim Fit, Regular Fit"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: Oversized, Slim Fit, Regular Fit, Loose, Tight, Relaxed
              </p>
            </div>

            <div>
              <label htmlFor="length" className="block text-sm font-medium text-gray-900 mb-1">
                Length
              </label>
              <Input
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                placeholder="e.g., Knee-Length, Ankle-Length, Cropped"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: Knee-Length, Ankle-Length, Floor-Length, Cropped, Mini
              </p>
            </div>

            <div>
              <label htmlFor="closure" className="block text-sm font-medium text-gray-900 mb-1">
                Closure Type
              </label>
              <Input
                id="closure"
                name="closure"
                value={formData.closure}
                onChange={handleChange}
                placeholder="e.g., Button-Down, Zipper, Pullover"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: Button-Down, Zipper, Pullover, Snap, Hook & Eye, Lace-Up
              </p>
            </div>

            <div>
              <label htmlFor="pattern" className="block text-sm font-medium text-gray-900 mb-1">
                Pattern/Style
              </label>
              <Input
                id="pattern"
                name="pattern"
                value={formData.pattern}
                onChange={handleChange}
                placeholder="e.g., Striped, Plain, Printed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: Striped, Plain, Printed, Embroidered, Checkered, Floral
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong>How variations work:</strong>
            </p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Create a base item (e.g., &quot;T-shirt&quot;) without variation attributes</li>
              <li>Create variations by filling in specific attributes (e.g., &quot;Full Sleeve Turtle Neck T-shirt&quot; with sleeveType=Full Sleeve, neckline=Turtle Neck)</li>
              <li>You can create multiple variations with different combinations of attributes</li>
              <li>Variations will be grouped and displayed together in the item library</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* AI Image Generation Prompt */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-black flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Image Generation Prompt
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Generate a comprehensive JSON prompt for AI image generators to create consistent, high-quality images of this item.
          Customize the generation parameters below.
        </p>

        {/* Prompt Customization Controls */}
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-900 mb-1">
                Background Color
              </label>
              <Input
                id="backgroundColor"
                name="backgroundColor"
                value={promptCustomization.backgroundColor}
                onChange={handlePromptCustomizationChange}
                placeholder="e.g., white, light gray, black"
              />
            </div>

            <div>
              <label htmlFor="itemColor" className="block text-sm font-medium text-gray-900 mb-1">
                Override Item Color (Optional)
              </label>
              <Input
                id="itemColor"
                name="itemColor"
                value={promptCustomization.itemColor}
                onChange={handlePromptCustomizationChange}
                placeholder="Leave blank to use colors from above"
              />
            </div>

            <div>
              <label htmlFor="lighting" className="block text-sm font-medium text-gray-900 mb-1">
                Lighting Type
              </label>
              <select
                id="lighting"
                name="lighting"
                value={promptCustomization.lighting}
                onChange={handlePromptCustomizationChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="studio lighting">Studio Lighting</option>
                <option value="natural lighting">Natural Lighting</option>
                <option value="soft diffused lighting">Soft Diffused Lighting</option>
                <option value="dramatic lighting">Dramatic Lighting</option>
                <option value="ambient lighting">Ambient Lighting</option>
              </select>
            </div>

            <div>
              <label htmlFor="cameraAngle" className="block text-sm font-medium text-gray-900 mb-1">
                Camera Angle
              </label>
              <select
                id="cameraAngle"
                name="cameraAngle"
                value={promptCustomization.cameraAngle}
                onChange={handlePromptCustomizationChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="front view">Front View</option>
                <option value="side view">Side View</option>
                <option value="back view">Back View</option>
                <option value="three-quarter view">Three-Quarter View</option>
                <option value="top view flat lay">Top View (Flat Lay)</option>
                <option value="45-degree angle">45-Degree Angle</option>
              </select>
            </div>

            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-900 mb-1">
                Photography Style
              </label>
              <select
                id="style"
                name="style"
                value={promptCustomization.style}
                onChange={handlePromptCustomizationChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="product photography">Product Photography</option>
                <option value="fashion photography">Fashion Photography</option>
                <option value="editorial photography">Editorial Photography</option>
                <option value="catalog photography">Catalog Photography</option>
                <option value="lifestyle photography">Lifestyle Photography</option>
              </select>
            </div>

            <div>
              <label htmlFor="promptFormat" className="block text-sm font-medium text-gray-900 mb-1">
                Prompt Format
              </label>
              <select
                id="promptFormat"
                value={promptFormat}
                onChange={(e) => setPromptFormat(e.target.value as 'json' | 'simple')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="json">Comprehensive JSON (Recommended)</option>
                <option value="simple">Simple Text Prompt</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-900 mb-1">
              Additional Instructions (Optional)
            </label>
            <textarea
              id="additionalDetails"
              name="additionalDetails"
              value={promptCustomization.additionalDetails}
              onChange={handlePromptCustomizationChange}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Any additional specific requirements for the generated image..."
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleGeneratePrompt}
            disabled={!formData.name.trim()}
            variant="outline"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate AI Prompt
          </Button>
          {!formData.name.trim() && (
            <span className="text-xs text-gray-500 self-center">Fill in item name first</span>
          )}
        </div>

        {/* Generated Prompt Display */}
        {showAIPrompt && generatedPrompt && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Generated Prompt:</h4>
              <Button
                type="button"
                onClick={handleCopyPrompt}
                variant="outline"
                size="sm"
              >
                {copiedPrompt ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
            <div className="relative">
              <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs overflow-x-auto max-h-96 overflow-y-auto">
                <code>{generatedPrompt}</code>
              </pre>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 <strong>Tip:</strong> Copy this prompt and paste it into AI image generators like Midjourney, DALL-E, Stable Diffusion, 
              or Leonardo.ai to create consistent reference images for this item. Then upload the generated image above. For best outcome use Nano banana Pro.
            </p>
          </div>
        )}
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
