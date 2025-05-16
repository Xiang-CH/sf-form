"use client";
import FormList from '@/components/FormList';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Prefetch routes after the component mounts
    router.prefetch('/form');
    router.prefetch('/entry');
    router.prefetch('/table');
  }, [router]); 

  return (
    <div className="min-h-[100dvh]">
      <FormList />
    </div>
  );
}
