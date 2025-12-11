'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ExportDataModal from '@/components/ExportDataModal';
import { 
  createFullBackup, 
  restoreFromBackup, 
  importFromFile, 
  validateData, 
  type ValidationIssue 
} from '@/lib/dataManagement';

interface StorageConfig {
  storageProvider: string;
  storageConfigured: boolean;
  maxFileSizeMB: number;
}

type SettingsTab = 'general' | 'storage' | 'database' | 'data' | 'appearance';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('data');
  const [config, setConfig] = useState<StorageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [backupProgress, setBackupProgress] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationIssue[] | null>(null);
  const [validating, setValidating] = useState(false);

  const tabs = [
    {
      id: 'general' as SettingsTab,
      label: 'General',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'storage' as SettingsTab,
      label: 'Storage',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
    {
      id: 'database' as SettingsTab,
      label: 'Database',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      id: 'data' as SettingsTab,
      label: 'Data Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'appearance' as SettingsTab,
      label: 'Appearance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/upload');
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Backup handlers
  const handleCreateBackup = async (includeImages: boolean = false) => {
    try {
      setBackupLoading(true);
      setBackupProgress('Creating backup...');
      
      if (includeImages) {
        setBackupProgress('Fetching data and images...');
        const response = await fetch('/api/backup');
        
        if (!response.ok) {
          throw new Error('Failed to create backup');
        }
        
        setBackupProgress('Downloading backup file...');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wardrobe-full-backup-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setBackupProgress('Backup created successfully!');
        setTimeout(() => setBackupProgress(''), 3000);
      } else {
        const blob = await createFullBackup();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wardrobe-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setBackupProgress('Backup created successfully!');
        setTimeout(() => setBackupProgress(''), 3000);
      }
    } catch (error) {
      console.error('Backup error:', error);
      setBackupProgress('Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('This will replace all existing data. Are you sure?')) {
      event.target.value = '';
      return;
    }

    try {
      setBackupLoading(true);
      setBackupProgress('Restoring from backup...');
      
      const success = await restoreFromBackup(file);
      
      if (success) {
        setBackupProgress('Restore completed successfully!');
        setTimeout(() => {
          setBackupProgress('');
          window.location.reload();
        }, 2000);
      } else {
        setBackupProgress('Failed to restore backup');
      }
    } catch (error) {
      console.error('Restore error:', error);
      setBackupProgress('Failed to restore backup');
    } finally {
      setBackupLoading(false);
      event.target.value = '';
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const type = prompt('Import as (items/outfits/characters):');
    if (!type || !['items', 'outfits', 'characters'].includes(type)) {
      alert('Invalid type. Must be items, outfits, or characters');
      event.target.value = '';
      return;
    }

    try {
      setBackupLoading(true);
      setBackupProgress('Importing data...');
      
      const result = await importFromFile(file, type as 'items' | 'outfits' | 'characters');
      
      if (result.success) {
        setBackupProgress(`Import completed! ${result.count} items imported.`);
        setTimeout(() => setBackupProgress(''), 3000);
      } else {
        setBackupProgress(`Failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      setBackupProgress('Failed to import data');
    } finally {
      setBackupLoading(false);
      event.target.value = '';
    }
  };

  const handleValidateData = async () => {
    try {
      setValidating(true);
      const results = await validateData();
      setValidationResults(results);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Failed to validate data');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your application preferences and data</p>
        </div>

        {/* Layout with Sidebar */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <Card className="sticky top-8">
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'general' && (
              <Card>
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Application Information</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p><strong>Version:</strong> 1.0.0</p>
                          <p className="mt-1"><strong>Build:</strong> Production</p>
                          <p className="mt-1"><strong>Environment:</strong> Next.js 14</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'storage' && (
              <Card>
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">Storage Configuration</h2>
                </div>
                
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Storage Provider
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {config?.storageProvider?.toUpperCase() || 'Not Set'}
                      </span>
                      {config?.storageConfigured ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          ✓ Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                          ⚠ Not Configured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Available Storage Options:</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Local Storage</h4>
                          <p className="text-sm text-gray-600">
                            Store images on your server in the public/uploads folder. Good for development and small deployments.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Cloudinary</h4>
                          <p className="text-sm text-gray-600">
                            Cloud-based image storage with automatic optimization, transformations, and CDN delivery. Recommended for production.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">How to Change Storage Provider</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Edit your <code className="bg-blue-100 px-1 rounded">.env.local</code> file</li>
                            <li>Set <code className="bg-blue-100 px-1 rounded">STORAGE_PROVIDER=local</code> or <code className="bg-blue-100 px-1 rounded">STORAGE_PROVIDER=cloudinary</code></li>
                            <li>For Cloudinary, add your credentials:
                              <ul className="ml-4 mt-1 space-y-0.5 list-disc list-inside">
                                <li><code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code></li>
                                <li><code className="bg-blue-100 px-1 rounded">CLOUDINARY_API_KEY</code></li>
                                <li><code className="bg-blue-100 px-1 rounded">CLOUDINARY_API_SECRET</code></li>
                              </ul>
                            </li>
                            <li>Restart your development server</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max File Size
                    </label>
                    <p className="text-sm text-gray-600">{config?.maxFileSizeMB || 10} MB</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Formats
                    </label>
                    <p className="text-sm text-gray-600">JPEG, PNG, WebP</p>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'database' && (
              <Card>
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">Database Configuration</h2>
                </div>
                
                <div className="px-6 py-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Database connection is configured via the <code className="bg-gray-200 px-1 rounded">MONGODB_URI</code> environment variable in your <code className="bg-gray-200 px-1 rounded">.env.local</code> file.
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Connection Status</h4>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        ✓ Connected to MongoDB Atlas
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'data' && (
              <Card>
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
                  <p className="mt-1 text-sm text-gray-500">Backup, restore, and manage your application data</p>
                </div>
                
                <div className="px-6 py-4 space-y-6">
                  {/* Progress indicator */}
                  {backupProgress && (
                    <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                      <div className="flex items-center gap-3">
                        {backupLoading && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                        <p className="text-sm text-blue-800">{backupProgress}</p>
                      </div>
                    </div>
                  )}

                  {/* Backup & Restore */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Backup & Restore</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Create a complete backup of your data or restore from a previous backup.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => handleCreateBackup(false)}
                        disabled={backupLoading}
                        variant="outline"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          />
                        </svg>
                        Backup (JSON Only)
                      </Button>
                      
                      <Button
                        onClick={() => handleCreateBackup(true)}
                        disabled={backupLoading}
                        variant="primary"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          />
                        </svg>
                        Full Backup (with Images)
                      </Button>
                      
                      <label className="inline-flex">
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Restore from Backup
                        </span>
                        <input
                          type="file"
                          accept=".json,.zip"
                          onChange={handleRestoreBackup}
                          className="hidden"
                          disabled={backupLoading}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Export Data</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Download your data in JSON or CSV format for backup or transfer purposes.
                    </p>
                    <Button
                      onClick={() => setShowExportModal(true)}
                      variant="outline"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export Data
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Import Data</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Import data from a previously exported JSON or CSV file.
                    </p>
                    <label className="inline-flex">
                      <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Import Data
                      </span>
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={handleImportData}
                        className="hidden"
                        disabled={backupLoading}
                      />
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Data Validation</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Check your data for errors, missing required fields, and broken relationships.
                    </p>
                    <Button
                      onClick={handleValidateData}
                      disabled={validating}
                      variant="outline"
                    >
                      {validating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Validating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Validate Data
                        </>
                      )}
                    </Button>
                    
                    {validationResults && (
                      <div className="mt-4 space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="text-2xl font-bold text-red-700">
                              {validationResults.filter(issue => issue.type === 'error').length}
                            </div>
                            <div className="text-sm text-red-600">Errors</div>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="text-2xl font-bold text-yellow-700">
                              {validationResults.filter(issue => issue.type === 'warning').length}
                            </div>
                            <div className="text-sm text-yellow-600">Warnings</div>
                          </div>
                        </div>
                        
                        {/* Errors */}
                        {validationResults.filter(issue => issue.type === 'error').length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-red-900 mb-2">Errors</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {validationResults.filter(issue => issue.type === 'error').map((error, index: number) => (
                                <div key={index} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                                  <div className="font-medium text-red-900">
                                    {error.entity}: {error.id}
                                  </div>
                                  <div className="text-red-700 mt-1">{error.message}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Warnings */}
                        {validationResults.filter(issue => issue.type === 'warning').length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-yellow-900 mb-2">Warnings</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {validationResults.filter(issue => issue.type === 'warning').map((warning, index: number) => (
                                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                                  <div className="font-medium text-yellow-900">
                                    {warning.entity}: {warning.id}
                                  </div>
                                  <div className="text-yellow-700 mt-1">{warning.message}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">Appearance Settings</h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Appearance customization options coming soon. You&apos;ll be able to customize themes, colors, and layout preferences.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </main>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <ExportDataModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
        )}
      </div>
    </div>
  );
}
