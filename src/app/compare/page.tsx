import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Loading';
import CompareItemsClient from './CompareItemsClient';

interface SearchParams {
  items?: string;
}

export default async function CompareItemsPage({
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
      <CompareItemsClient items={params.items} />
    </Suspense>
  );
}
