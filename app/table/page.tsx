'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import FormTable from '@/components/FormTable';

export default function FormTablePage() {
  const params = useSearchParams();
  const router = useRouter();
  const formId = params.get("formId") as string;

  if (!formId) {
    router.push('/');
  }

  return (
    <div className="min-h-[100dvh]">
      <FormTable formId={formId} />
    </div>
  );
}
