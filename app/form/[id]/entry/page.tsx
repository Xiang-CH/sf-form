'use client';

import { useParams } from 'next/navigation';
import FormEntry from '@/components/FormEntry';

export default function FormEntryPage() {
  const params = useParams();
  const formId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <FormEntry formId={formId} />
    </div>
  );
}
