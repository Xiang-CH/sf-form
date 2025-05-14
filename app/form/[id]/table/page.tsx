'use client';

import { useParams } from 'next/navigation';
import FormTable from '@/components/FormTable';

export default function FormTablePage() {
  const params = useParams();
  const formId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <FormTable formId={formId} />
    </div>
  );
}
