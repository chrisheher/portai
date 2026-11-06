'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Chat from '../components/chat/chat';
import SearchHome from '../components/search/SearchHome';

// The home page is the search. Existing deep links (/?show=<page>, /?query=...) still
// open the portfolio as before, so search results and old links land on real pages.
function Home() {
  const params = useSearchParams();
  if (params.get('show') || params.get('query')) {
    return (
      <main className="h-screen w-full flex items-center justify-center">
        <Chat />
      </main>
    );
  }
  return <SearchHome />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
