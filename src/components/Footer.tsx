'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-lg font-bold text-gray-900">Wardrobe Chronicle</span>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              A comprehensive clothing database management system for writers, costume designers, and world-builders. 
              Organize your wardrobe collections with historical references and detailed cataloging.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/items" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Items
                </Link>
              </li>
              <li>
                <Link href="/outfits" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Outfits
                </Link>
              </li>
              <li>
                <Link href="/characters" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Characters
                </Link>
              </li>
              <li>
                <Link href="/timeline" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Timeline
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('show-shortcuts-help'))}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors text-left"
                >
                  Keyboard Shortcuts
                </button>
              </li>
              <li>
                <a 
                  href="https://github.com/TheFakeCreator/Dressbook" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  GitHub
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Wardrobe Chronicle. Built for storytellers and creators.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">v1.0.0</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">
              Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">Shift</kbd> + 
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded ml-1">?</kbd> for shortcuts
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
