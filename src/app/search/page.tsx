'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SearchResults {
  query: string;
  totalResults: number;
  items: { data: any[]; total: number; pages: number };
  outfits: { data: any[]; total: number; pages: number };
  characters: { data: any[]; total: number; pages: number };
}

interface QueryCondition {
  id: string;
  entity: 'items' | 'outfits' | 'characters' | 'timeline';
  field: string;
  operator: 'equals' | 'contains' | 'in' | 'gt' | 'lt' | 'between';
  value: string | string[];
}

interface SavedQuery {
  id: string;
  name: string;
  description: string;
  conditions: QueryCondition[];
  createdAt: string;
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

const ENTITY_OPTIONS = [
  { value: 'items', label: 'Clothing Items' },
  { value: 'outfits', label: 'Outfits' },
  { value: 'characters', label: 'Characters' },
  { value: 'timeline', label: 'Timeline Entries' },
];

const FIELD_OPTIONS: Record<string, { value: string; label: string; type: string }[]> = {
  items: [
    { value: 'name', label: 'Name', type: 'text' },
    { value: 'category', label: 'Category', type: 'select' },
    { value: 'colors', label: 'Colors', type: 'array' },
    { value: 'tags', label: 'Tags', type: 'array' },
    { value: 'materials', label: 'Materials', type: 'array' },
    { value: 'realWorldReference.historicalPeriod', label: 'Historical Period', type: 'text' },
    { value: 'realWorldReference.geographicOrigin', label: 'Geographic Origin', type: 'text' },
  ],
  outfits: [
    { value: 'name', label: 'Name', type: 'text' },
    { value: 'tags', label: 'Tags', type: 'array' },
    { value: 'occasion', label: 'Occasion', type: 'text' },
    { value: 'season', label: 'Season', type: 'text' },
  ],
  characters: [
    { value: 'name', label: 'Name', type: 'text' },
    { value: 'role', label: 'Role', type: 'text' },
  ],
  timeline: [
    { value: 'chapter', label: 'Chapter', type: 'number' },
    { value: 'scene', label: 'Scene', type: 'number' },
    { value: 'context', label: 'Context', type: 'text' },
  ],
};

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals', types: ['text', 'select', 'number'] },
  { value: 'contains', label: 'Contains', types: ['text', 'array'] },
  { value: 'in', label: 'Is one of', types: ['select', 'array'] },
  { value: 'gt', label: 'Greater than', types: ['number'] },
  { value: 'lt', label: 'Less than', types: ['number'] },
  { value: 'between', label: 'Between', types: ['number'] },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'items' | 'outfits' | 'characters'>('all');
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');
  
  // Simple search filters
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [gender, setGender] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [geographicOrigin, setGeographicOrigin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Advanced query builder
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [queryDescription, setQueryDescription] = useState('');

  useEffect(() => {
    loadSavedQueries();
  }, []);

  const loadSavedQueries = () => {
    const saved = localStorage.getItem('savedQueries');
    if (saved) {
      setSavedQueries(JSON.parse(saved));
    }
  };

  const addCondition = () => {
    const newCondition: QueryCondition = {
      id: Math.random().toString(36).substr(2, 9),
      entity: 'items',
      field: 'name',
      operator: 'contains',
      value: '',
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<QueryCondition>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const getFieldType = (entity: string, field: string) => {
    const fields = FIELD_OPTIONS[entity] || [];
    const fieldOption = fields.find(f => f.value === field);
    return fieldOption?.type || 'text';
  };

  const saveQuery = () => {
    if (!queryName.trim()) {
      alert('Please enter a query name');
      return;
    }

    const newQuery: SavedQuery = {
      id: Math.random().toString(36).substr(2, 9),
      name: queryName,
      description: queryDescription,
      conditions: [...conditions],
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedQueries, newQuery];
    setSavedQueries(updated);
    localStorage.setItem('savedQueries', JSON.stringify(updated));
    
    setShowSaveDialog(false);
    setQueryName('');
    setQueryDescription('');
    alert('Query saved successfully!');
  };

  const loadQuery = (savedQuery: SavedQuery) => {
    setConditions(savedQuery.conditions);
    setSearchMode('advanced');
  };

  const deleteQuery = (id: string) => {
    if (confirm('Are you sure you want to delete this saved query?')) {
      const updated = savedQueries.filter(q => q.id !== id);
      setSavedQueries(updated);
      localStorage.setItem('savedQueries', JSON.stringify(updated));
    }
  };

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let params = new URLSearchParams();
      
      if (searchMode === 'simple' && query) {
        // Simple search mode
        params.append('q', query);
        if (category) params.append('category', category);
        if (tags) params.append('tags', tags);
        if (gender) params.append('gender', gender);
        if (periodStart) params.append('periodStart', periodStart);
        if (periodEnd) params.append('periodEnd', periodEnd);
        if (geographicOrigin) params.append('geographicOrigin', geographicOrigin);

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data);
      } else if (searchMode === 'advanced' && conditions.length > 0) {
        // Advanced query mode
        const primaryEntity = conditions[0].entity;
        
        conditions.forEach(condition => {
          if (condition.value) {
            if (condition.operator === 'contains' && Array.isArray(condition.value)) {
              condition.value.forEach(v => params.append(condition.field, v));
            } else if (typeof condition.value === 'string') {
              if (condition.operator === 'gt') {
                params.append(`${condition.field}[gt]`, condition.value);
              } else if (condition.operator === 'lt') {
                params.append(`${condition.field}[lt]`, condition.value);
              } else {
                params.append(condition.field, condition.value);
              }
            }
          }
        });

        const response = await fetch(`/api/${primaryEntity}?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          // Format results to match SearchResults structure
          const entityData = data.data || data.items || data.outfits || data.characters || [];
          setResults({
            query: 'Advanced Query',
            totalResults: entityData.length,
            items: primaryEntity === 'items' ? { data: entityData, total: entityData.length, pages: 1 } : { data: [], total: 0, pages: 0 },
            outfits: primaryEntity === 'outfits' ? { data: entityData, total: entityData.length, pages: 1 } : { data: [], total: 0, pages: 0 },
            characters: primaryEntity === 'characters' ? { data: entityData, total: entityData.length, pages: 1 } : { data: [], total: 0, pages: 0 },
          });
        }
      }
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchMode, query, category, tags, gender, periodStart, periodEnd, geographicOrigin, conditions]);

  useEffect(() => {
    if ((searchMode === 'simple' && query) || (searchMode === 'advanced' && conditions.length > 0)) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [query, category, tags, gender, periodStart, periodEnd, geographicOrigin, conditions, searchMode, performSearch]);

  const clearFilters = () => {
    setCategory('');
    setTags('');
    setGender('');
    setPeriodStart('');
    setPeriodEnd('');
    setGeographicOrigin('');
  };

  const hasActiveFilters = category || tags || gender || periodStart || periodEnd || geographicOrigin;

  // Empty state - no query and no conditions
  if (!query && conditions.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center mb-8">
          <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Search Your Wardrobe</h2>
          <p className="mt-2 text-gray-600">Use the search bar above or try advanced query builder below.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setSearchMode('simple')}
              className={`px-4 py-2 text-sm font-medium border ${
                searchMode === 'simple'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-l-lg`}
            >
              Simple Search
            </button>
            <button
              onClick={() => setSearchMode('advanced')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                searchMode === 'advanced'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-r-lg`}
            >
              Advanced Query Builder
            </button>
          </div>
        </div>

        {/* Query Builder for empty state */}
        {searchMode === 'advanced' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Build Your Query</h3>
                <Button onClick={addCondition} size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Condition
                </Button>
              </div>

              {conditions.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-600 mb-4">No conditions added yet</p>
                  <Button onClick={addCondition} variant="secondary">
                    Add Your First Condition
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={condition.id} className="relative p-4 border border-gray-200 rounded-lg bg-white">
                      {index > 0 && (
                        <div className="absolute -top-3 left-4 bg-gray-50 px-2 py-1 rounded text-xs font-medium text-gray-600">
                          AND
                        </div>
                      )}
                      
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Entity</label>
                          <select
                            value={condition.entity}
                            onChange={(e) => updateCondition(condition.id, { 
                              entity: e.target.value as QueryCondition['entity'],
                              field: FIELD_OPTIONS[e.target.value][0].value 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            {ENTITY_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Field</label>
                          <select
                            value={condition.field}
                            onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            {(FIELD_OPTIONS[condition.entity] || []).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Operator</label>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(condition.id, { operator: e.target.value as QueryCondition['operator'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            {OPERATOR_OPTIONS.filter(op => 
                              op.types.includes(getFieldType(condition.entity, condition.field))
                            ).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                          <input
                            type="text"
                            value={condition.value as string}
                            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                            placeholder="Enter value..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeCondition(condition.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-4">
                    <Button onClick={performSearch} className="flex-1">
                      Execute Query
                    </Button>
                    <Button onClick={() => setShowSaveDialog(true)} variant="secondary">
                      Save Query
                    </Button>
                    <Button onClick={() => setConditions([])} variant="outline">
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Queries */}
            {savedQueries.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Saved Queries ({savedQueries.length})
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedQueries.map(sq => (
                    <div key={sq.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{sq.name}</h4>
                        <button
                          onClick={() => deleteQuery(sq.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {sq.description && <p className="text-xs text-gray-600 mb-2">{sq.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{sq.conditions.length} conditions</span>
                        <Button onClick={() => loadQuery(sq)} variant="outline" size="sm">
                          Load
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const tabs = [
    { id: 'all' as const, label: 'All', count: results.totalResults },
    { id: 'items' as const, label: 'Items', count: results.items.total },
    { id: 'outfits' as const, label: 'Outfits', count: results.outfits.total },
    { id: 'characters' as const, label: 'Characters', count: results.characters.total },
  ];

  const showItems = activeTab === 'all' || activeTab === 'items';
  const showOutfits = activeTab === 'all' || activeTab === 'outfits';
  const showCharacters = activeTab === 'all' || activeTab === 'characters';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {searchMode === 'simple' ? `Search Results for "${query}"` : 'Advanced Query Results'}
            </h1>
            <p className="mt-2 text-gray-600">
              {results.totalResults} {results.totalResults === 1 ? 'result' : 'results'} found
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => {
                setSearchMode('simple');
                if (!query) {
                  router.push('/search');
                }
              }}
              className={`px-4 py-2 text-sm font-medium border ${
                searchMode === 'simple'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-l-lg`}
            >
              Simple Search
            </button>
            <button
              onClick={() => setSearchMode('advanced')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                searchMode === 'advanced'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } rounded-r-lg`}
            >
              Advanced Query
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Query Builder (when in advanced mode) */}
      {searchMode === 'advanced' && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Query Conditions</h3>
            <Button onClick={addCondition} size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Condition
            </Button>
          </div>

          {conditions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No conditions set. Add conditions to refine your search.</p>
              <Button onClick={addCondition} variant="secondary">
                Add First Condition
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="relative p-4 border border-gray-200 rounded-lg bg-gray-50">
                  {index > 0 && (
                    <div className="absolute -top-3 left-4 bg-white px-2 py-1 rounded text-xs font-medium text-gray-600 border border-gray-200">
                      AND
                    </div>
                  )}
                  
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Entity</label>
                      <select
                        value={condition.entity}
                        onChange={(e) => updateCondition(condition.id, { 
                          entity: e.target.value as QueryCondition['entity'],
                          field: FIELD_OPTIONS[e.target.value][0].value 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                      >
                        {ENTITY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Field</label>
                      <select
                        value={condition.field}
                        onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                      >
                        {(FIELD_OPTIONS[condition.entity] || []).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Operator</label>
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.id, { operator: e.target.value as QueryCondition['operator'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                      >
                        {OPERATOR_OPTIONS.filter(op => 
                          op.types.includes(getFieldType(condition.entity, condition.field))
                        ).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                      <input
                        type="text"
                        value={condition.value as string}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        placeholder="Enter value..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <Button onClick={performSearch} className="flex-1">
                  Execute Query
                </Button>
                <Button onClick={() => setShowSaveDialog(true)} variant="secondary">
                  Save Query
                </Button>
                <Button onClick={() => setConditions([])} variant="outline">
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Saved Queries Dropdown */}
          {savedQueries.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 py-2">
                Saved Queries ({savedQueries.length})
              </summary>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {savedQueries.map(sq => (
                  <div key={sq.id} className="p-3 border border-gray-200 rounded bg-white">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{sq.name}</h4>
                      <button
                        onClick={() => deleteQuery(sq.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {sq.description && <p className="text-xs text-gray-600 mb-2">{sq.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{sq.conditions.length} conditions</span>
                      <Button onClick={() => loadQuery(sq)} variant="outline" size="sm">
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Filter Results</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="formal, casual, summer"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {/* Period Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period Start (Year)
              </label>
              <input
                type="number"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                placeholder="1800"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Period End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period End (Year)
              </label>
              <input
                type="number"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                placeholder="1900"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Geographic Origin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geographic Origin
              </label>
              <input
                type="text"
                value={geographicOrigin}
                onChange={(e) => setGeographicOrigin(e.target.value)}
                placeholder="Victorian England"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-12">
        {/* Items Results */}
        {showItems && results.items.total > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Items ({results.items.total})
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.items.data.map((item: any) => (
                <Link
                  key={item._id}
                  href={`/items/${item._id}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-48 bg-gray-100">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0].thumbnail || item.images[0].url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Outfits Results */}
        {showOutfits && results.outfits.total > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Outfits ({results.outfits.total})
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.outfits.data.map((outfit: any) => (
                <Link
                  key={outfit._id}
                  href={`/outfits/${outfit._id}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {outfit.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {outfit.items?.length || 0} {outfit.items?.length === 1 ? 'item' : 'items'}
                    </p>
                    {outfit.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {outfit.description}
                      </p>
                    )}
                    {outfit.tags && outfit.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {outfit.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Characters Results */}
        {showCharacters && results.characters.total > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Characters ({results.characters.total})
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.characters.data.map((character: any) => (
                <Link
                  key={character._id}
                  href={`/characters/${character._id}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {character.name}
                    </h3>
                    {character.role && (
                      <p className="mt-1 text-sm text-gray-500">{character.role}</p>
                    )}
                    {character.description && (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {character.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {results.totalResults === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No results found</h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>

      {/* Save Query Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Save Query</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Query Name *
                </label>
                <input
                  type="text"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="e.g., Red Victorian Items"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={queryDescription}
                  onChange={(e) => setQueryDescription(e.target.value)}
                  placeholder="Describe what this query does..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={saveQuery} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setQueryName('');
                    setQueryDescription('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
