'use client';

import { useSearchParams } from 'next/navigation';
import FormMetadata from '@/components/FormMetadata';

export default function EditFormPage() {
  const params = useSearchParams();
  const formId = params.get("formId") as string ?? "new";

  return (
    <div className="bg-gray-50">
      <FormMetadata formId={formId} />
    </div>
  );
}
