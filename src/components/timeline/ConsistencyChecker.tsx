'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';

interface ConflictIssue {
  type: 'multiple_outfits' | 'item_conflict' | 'missing_data';
  severity: 'high' | 'medium' | 'low';
  message: string;
  details: {
    characterId?: string;
    characterName?: string;
    chapter?: string;
    scene?: string;
    outfitIds?: string[];
    outfitNames?: string[];
    itemId?: string;
    itemName?: string;
    entryIds?: string[];
  };
}

interface ConsistencySummary {
  total: number;
  high: number;
  medium: number;
  low: number;
  byType: {
    multiple_outfits: number;
    item_conflict: number;
    missing_data: number;
  };
}

export function ConsistencyChecker() {
  const [checking, setChecking] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictIssue[]>([]);
  const [summary, setSummary] = useState<ConsistencySummary | null>(null);

  const runConsistencyCheck = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/timeline/consistency');
      if (!response.ok) {
        throw new Error('Failed to check consistency');
      }

      const data = await response.json();
      setConflicts(data.conflicts || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Consistency check failed:', error);
      alert('Failed to check timeline consistency');
    } finally {
      setChecking(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
      default:
        return '📋';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_outfits':
        return '👔';
      case 'item_conflict':
        return '🔄';
      case 'missing_data':
        return '❓';
      default:
        return '📝';
    }
  };

  if (!summary && !checking) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Timeline Consistency Checker
          </h3>
          <p className="text-gray-600 mb-6">
            Scan your timeline for potential conflicts and inconsistencies
          </p>
          <Button onClick={runConsistencyCheck} className="mx-auto">
            <span className="mr-2">🔍</span>
            Run Consistency Check
          </Button>
          <div className="mt-6 text-left bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">What we check:</p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>Characters wearing multiple outfits in the same scene</li>
              <li>Clothing items used in multiple outfits simultaneously</li>
              <li>Missing chapter, character, or outfit data</li>
              <li>Timeline gaps and inconsistencies</li>
            </ul>
          </div>
        </div>
      </Card>
    );
  }

  if (checking) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Analyzing timeline for conflicts...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Consistency Check Results</h3>
          <Button onClick={runConsistencyCheck} variant="secondary" size="sm">
            <span className="mr-2">🔄</span>
            Re-check
          </Button>
        </div>

        {summary && (
          <>
            {/* Overall Status */}
            <div className="mb-6">
              {summary.total === 0 ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-900 font-semibold">No conflicts detected!</p>
                  <p className="text-green-700 text-sm">Your timeline is consistent.</p>
                </div>
              ) : (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="text-orange-900 font-semibold">
                    Found {summary.total} potential issue{summary.total !== 1 ? 's' : ''}
                  </p>
                  <p className="text-orange-700 text-sm">Review the conflicts below.</p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            {summary.total > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-900">{summary.high}</div>
                  <div className="text-sm text-red-700">High Severity</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-900">{summary.medium}</div>
                  <div className="text-sm text-yellow-700">Medium</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">{summary.low}</div>
                  <div className="text-sm text-blue-700">Low</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                  <div className="text-sm text-gray-700">Total Issues</div>
                </div>
              </div>
            )}

            {/* Type Breakdown */}
            {summary.total > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">By Type:</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">{summary.byType.multiple_outfits}</span> Multiple Outfits
                  </div>
                  <div>
                    <span className="font-semibold">{summary.byType.item_conflict}</span> Item Conflicts
                  </div>
                  <div>
                    <span className="font-semibold">{summary.byType.missing_data}</span> Missing Data
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Conflicts List */}
      {conflicts.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Detected Issues</h4>
          <div className="space-y-3">
            {conflicts.map((conflict, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 ${getSeverityColor(conflict.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">
                    {getSeverityIcon(conflict.severity)}
                    {getTypeIcon(conflict.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                        {conflict.severity} severity
                      </span>
                    </div>
                    <p className="font-semibold mb-2">{conflict.message}</p>
                    <div className="text-sm space-y-1 opacity-90">
                      {conflict.details.characterName && (
                        <p>
                          <strong>Character:</strong> {conflict.details.characterName}
                        </p>
                      )}
                      {conflict.details.chapter && (
                        <p>
                          <strong>Location:</strong> Chapter {conflict.details.chapter}
                          {conflict.details.scene && `, Scene ${conflict.details.scene}`}
                        </p>
                      )}
                      {conflict.details.outfitNames && conflict.details.outfitNames.length > 0 && (
                        <p>
                          <strong>Outfits:</strong> {conflict.details.outfitNames.join(', ')}
                        </p>
                      )}
                      {conflict.details.itemName && (
                        <p>
                          <strong>Item:</strong> {conflict.details.itemName}
                        </p>
                      )}
                      {conflict.details.entryIds && conflict.details.entryIds.length > 0 && (
                        <div className="mt-2">
                          <Link
                            href={`/timeline?chapter=${conflict.details.chapter || ''}`}
                            className="text-xs underline hover:no-underline"
                          >
                            View in Timeline →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
