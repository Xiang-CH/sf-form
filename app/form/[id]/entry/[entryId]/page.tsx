'use client';
import { useParams } from 'next/navigation';
import FormEntry from '@/app/components/FormEntry';

export default function EditEntryPage() {
  const params = useParams();
  const formId = params.id as string;
  const entryId = params.entryId as string;

  return <FormEntry formId={formId} entryId={entryId} />;
}
