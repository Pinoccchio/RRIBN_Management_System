'use client';

import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { CreateRIDSWizard } from '@/components/dashboard/rids/CreateRIDSWizard';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function CreateRIDSPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Create New RIDS"
        description="Reservist Information Data Sheet - Multi-step creation wizard"
        action={
          <Button variant="outline" onClick={() => router.push('/staff/rids')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        }
      />

      {/* Wizard */}
      <CreateRIDSWizard />
    </div>
  );
}
