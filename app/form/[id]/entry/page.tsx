'use client';

import { useParams, useSearchParams } from 'next/navigation';
import FormEntry from '@/components/FormEntry';

export default function FormEntryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = params.id as string;
  const entryId = searchParams.get('entryId');

  return (
    <div className="min-h-screen bg-gray-50">
      <FormEntry formId={formId} entryId={entryId}/>
    </div>
  );
}
