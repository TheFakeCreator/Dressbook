'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface StorageConfig {
  storageProvider: string;
  storageConfigured: boolean;
  maxFileSizeMB: number;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<StorageConfig | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Configure your application settings</p>
        </div>

        {/* Storage Configuration */}
        <Card className="mb-6">
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

        {/* Database Configuration */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Database Configuration</h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Database connection is configured via the <code className="bg-gray-200 px-1 rounded">MONGODB_URI</code> environment variable in your <code className="bg-gray-200 px-1 rounded">.env.local</code> file.
              </p>
            </div>
          </div>
        </Card>

        {/* Application Info */}
        <Card>
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Application Information</h2>
          </div>
          
          <div className="px-6 py-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Version</label>
              <p className="text-sm text-gray-600">1.0.0</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <p className="text-sm text-gray-600">Development</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
