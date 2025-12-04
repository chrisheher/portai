'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const Chat = dynamic(() => import('@/components/chat/chat'), { ssr: false });

export default function Home() {
  return (
    <main className="h-screen w-full flex items-center justify-center bg-slate-200">

     
     <Suspense fallback={<div>Loading chat...</div>}>
        <Chat />
      </Suspense>
    </main>
  );
}
