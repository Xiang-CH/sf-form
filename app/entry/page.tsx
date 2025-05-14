'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import FormEntry from '@/components/FormEntry';

export default function FormEntryPage() {
  const router = useRouter();
  const params = useSearchParams();
  const searchParams = useSearchParams();
  const formId = params.get('formId') as string;
  const entryId = searchParams.get('entryId');

  if (!formId) {
    router.push('/form');
  }

  return (
    <div className="min-h-[100dvh]">
      <FormEntry formId={formId} entryId={entryId}/>
    </div>
  );
}
