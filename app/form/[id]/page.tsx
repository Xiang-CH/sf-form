'use client';

import { useParams } from 'next/navigation';
import FormMetadata from '@/components/FormMetadata';

export default function EditFormPage() {
  const params = useParams();
  const formId = params.id as string;

  return (
    <div className="bg-gray-50">
      <FormMetadata formId={formId} />
    </div>
  );
}
