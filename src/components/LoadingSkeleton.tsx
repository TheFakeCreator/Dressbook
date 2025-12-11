import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const ItemCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <SkeletonBox className="w-full h-48" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-6 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <SkeletonBox className="h-6 w-16" />
          <SkeletonBox className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
};

export const ItemGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const OutfitCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <SkeletonBox className="w-full h-64" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-6 w-2/3" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <SkeletonBox className="h-6 w-20" />
          <SkeletonBox className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
};

export const OutfitGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <OutfitCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CharacterCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-4 mb-4">
        <SkeletonBox className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-6 w-1/2" />
          <SkeletonBox className="h-4 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

export const CharacterGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CharacterCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const TimelineEntrySkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <SkeletonBox className="w-24 h-24 rounded shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-5 w-32" />
          </div>
          <SkeletonBox className="h-6 w-1/3" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  );
};

export const TimelineListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TimelineEntrySkeleton key={i} />
      ))}
    </div>
  );
};

export const DetailPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SkeletonBox className="w-full h-96 rounded-lg" />
          <div className="flex gap-2 mt-4">
            <SkeletonBox className="w-20 h-20 rounded" />
            <SkeletonBox className="w-20 h-20 rounded" />
            <SkeletonBox className="w-20 h-20 rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <SkeletonBox className="h-8 w-3/4 mb-4" />
            <div className="flex gap-2 mb-4">
              <SkeletonBox className="h-6 w-24" />
              <SkeletonBox className="h-6 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <SkeletonBox className="h-5 w-24 mb-2" />
              <SkeletonText lines={3} />
            </div>
            <div>
              <SkeletonBox className="h-5 w-24 mb-2" />
              <div className="flex gap-2">
                <SkeletonBox className="h-6 w-16" />
                <SkeletonBox className="h-6 w-16" />
                <SkeletonBox className="h-6 w-16" />
              </div>
            </div>
            <div>
              <SkeletonBox className="h-5 w-24 mb-2" />
              <div className="flex gap-2">
                <SkeletonBox className="h-6 w-20" />
                <SkeletonBox className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <SkeletonBox className="h-5 w-2/3 mb-4" />
            <SkeletonBox className="h-10 w-1/2" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <SkeletonBox className="h-6 w-1/4 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBox className="h-5 w-32" />
          <SkeletonBox className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <SkeletonBox className="h-10 w-24" />
        <SkeletonBox className="h-10 w-24" />
      </div>
    </div>
  );
};
