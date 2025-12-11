import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Loading';
import ComparePageClient from './ComparePageClient';

interface SearchParams {
  ids?: string;
}

// Server Component - receives searchParams from Next.js
export default async function OutfitComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ComparePageClient ids={params.ids} />
    </Suspense>
  );
}
