'use client';

import React, { useState, useEffect } from 'react';
import QuickAddModal from './QuickAddModal';

const QuickActionButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleQuickAdd = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('quickAdd', handleQuickAdd);
    return () => window.removeEventListener('quickAdd', handleQuickAdd);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Quick add item"
        title="Quick Add Item (Ctrl+N)"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <QuickAddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default QuickActionButton;
