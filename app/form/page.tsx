'use client';

import { useSearchParams } from 'next/navigation';
import FormMetadata from '@/components/FormMetadata';

export default function EditFormPage() {
  const params = useSearchParams();
  const formId = params.get("formId") as string ?? "new";

  return (
    <div>
      <FormMetadata formId={formId} />
    </div>
  );
}
