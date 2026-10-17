import { StatCards } from '@/components/dashboard/StatCards';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AtmStatusMap } from '@/components/dashboard/AtmStatusMap';
import { CashAvailability } from '@/components/dashboard/CashAvailability';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TopAtms } from '@/components/dashboard/TopAtms';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { PageHeader } from '@/components/shared/PageHeader';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Full network oversight — ATMs, cash, transactions, users and system health"
      />

      <StatCards />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionChart />
        </div>
        <QuickActions />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AtmStatusMap />
        <CashAvailability />
      </div>

      <RecentTransactions />

      <div className="grid gap-6 xl:grid-cols-2">
        <TopAtms />
        <AlertsList />
      </div>
    </div>
  );
}
