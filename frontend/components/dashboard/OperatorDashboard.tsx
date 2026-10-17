import { StatCards } from '@/components/dashboard/StatCards';
import { AtmStatusMap } from '@/components/dashboard/AtmStatusMap';
import { CashAvailability } from '@/components/dashboard/CashAvailability';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PageHeader } from '@/components/shared/PageHeader';

export function OperatorDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Operator Dashboard"
        description="Day-to-day operations — ATM status, cash refills and active alerts"
      />

      <StatCards />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AtmStatusMap />
        </div>
        <QuickActions />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AlertsList />
        <CashAvailability />
      </div>

      <RecentTransactions />
    </div>
  );
}
