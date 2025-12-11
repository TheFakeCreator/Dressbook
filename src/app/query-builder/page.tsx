'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

interface ResultItem {
  _id: string;
  name: string;
  category?: string;
  role?: string;
  [key: string]: unknown;
}

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

export default function QueryBuilderPage() {
  const router = useRouter();
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
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

  const executeQuery = async () => {
    if (conditions.length === 0) {
      alert('Please add at least one condition');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // Build query parameters
      const primaryEntity = conditions[0].entity;
      const params = new URLSearchParams();
      
      conditions.forEach(condition => {
        if (condition.value) {
          if (condition.operator === 'contains' && Array.isArray(condition.value)) {
            condition.value.forEach(v => params.append(condition.field, v));
          } else if (typeof condition.value === 'string') {
            params.append(condition.field, condition.value);
          }
        }
      });

      // Execute the query
      const response = await fetch(`/api/${primaryEntity}?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data || data.items || data.outfits || data.characters || []);
      }
    } catch (error) {
      console.error('Query execution error:', error);
      alert('Failed to execute query');
    } finally {
      setLoading(false);
    }
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

  const loadQuery = (query: SavedQuery) => {
    setConditions(query.conditions);
    setResults([]);
  };

  const deleteQuery = (id: string) => {
    if (confirm('Are you sure you want to delete this saved query?')) {
      const updated = savedQueries.filter(q => q.id !== id);
      setSavedQueries(updated);
      localStorage.setItem('savedQueries', JSON.stringify(updated));
    }
  };

  const getFieldType = (entity: string, field: string) => {
    const fields = FIELD_OPTIONS[entity] || [];
    const fieldOption = fields.find(f => f.value === field);
    return fieldOption?.type || 'text';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-blue-600">Search</Link>
            <span>/</span>
            <span className="text-gray-900">Query Builder</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Query Builder</h1>
              <p className="text-gray-600 mt-1">
                Build complex queries with multiple conditions
              </p>
            </div>
            <Button variant="secondary" onClick={() => router.push('/search')}>
              Back to Search
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Query Builder */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Query Conditions</h2>
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
                        {/* Entity */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Entity
                          </label>
                          <select
                            value={condition.entity}
                            onChange={(e) => updateCondition(condition.id, { 
                              entity: e.target.value as QueryCondition['entity'],
                              field: FIELD_OPTIONS[e.target.value][0].value 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {ENTITY_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Field */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Field
                          </label>
                          <select
                            value={condition.field}
                            onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {(FIELD_OPTIONS[condition.entity] || []).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Operator */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Operator
                          </label>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(condition.id, { operator: e.target.value as QueryCondition['operator'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {OPERATOR_OPTIONS.filter(op => 
                              op.types.includes(getFieldType(condition.entity, condition.field))
                            ).map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Value */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Value
                          </label>
                          <Input
                            type="text"
                            value={condition.value as string}
                            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                            placeholder="Enter value..."
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeCondition(condition.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove condition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {conditions.length > 0 && (
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={executeQuery}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Executing...' : 'Execute Query'}
                  </Button>
                  <Button
                    onClick={() => setShowSaveDialog(true)}
                    variant="secondary"
                  >
                    Save Query
                  </Button>
                  <Button
                    onClick={() => setConditions([])}
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </Card>

            {/* Results */}
            {results.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Results ({results.length})
                </h2>
                <div className="space-y-2">
                  {results.map((result) => (
                    <Link
                      key={result._id}
                      href={`/${conditions[0].entity}/${result._id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900">{result.name}</h3>
                      {result.category && (
                        <p className="text-sm text-gray-600">{result.category}</p>
                      )}
                      {result.role && (
                        <p className="text-sm text-gray-600">{result.role}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Saved Queries Sidebar */}
          <div>
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Saved Queries ({savedQueries.length})
              </h2>

              {savedQueries.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">
                  No saved queries yet
                </p>
              ) : (
                <div className="space-y-3">
                  {savedQueries.map(query => (
                    <div key={query.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">{query.name}</h3>
                        <button
                          onClick={() => deleteQuery(query.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete query"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {query.description && (
                        <p className="text-xs text-gray-600 mb-2">{query.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {query.conditions.length} condition{query.conditions.length !== 1 ? 's' : ''}
                        </span>
                        <Button
                          onClick={() => loadQuery(query)}
                          variant="outline"
                          size="sm"
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Query Examples */}
            <Card className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Example Queries
              </h3>
              <div className="space-y-3 text-xs text-gray-600">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="font-medium text-blue-900 mb-1">Red Victorian items</p>
                  <p>Entity: Items → Colors contains &ldquo;red&rdquo; AND Historical Period contains &ldquo;Victorian&rdquo;</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="font-medium text-green-900 mb-1">Formal outfits</p>
                  <p>Entity: Outfits → Tags contains &ldquo;formal&rdquo;</p>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <p className="font-medium text-purple-900 mb-1">Chapter 5 timeline</p>
                  <p>Entity: Timeline → Chapter equals &ldquo;5&rdquo;</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Save Query Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Save Query</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Query Name *
                  </label>
                  <Input
                    type="text"
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    placeholder="e.g., Red Victorian Items"
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

                <div className="flex gap-3">
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
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
