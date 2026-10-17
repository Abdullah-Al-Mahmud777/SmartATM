import { StatCards } from '@/components/dashboard/StatCards';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { AtmStatusMap } from '@/components/dashboard/AtmStatusMap';
import { CashAvailability } from '@/components/dashboard/CashAvailability';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TopAtms } from '@/components/dashboard/TopAtms';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { PageHeader } from '@/components/shared/PageHeader';

export function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description="Operations & performance — cash levels, transaction trends and team alerts"
      />

      <StatCards />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionChart />
        </div>
        <TopAtms />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CashAvailability />
        <AlertsList />
      </div>

      <RecentTransactions />

      <AtmStatusMap />
    </div>
  );
}
