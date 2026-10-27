'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BellRing,
  CheckCheck,
  CreditCard,
  Landmark,
  Loader2,
  LockKeyhole,
  ReceiptText,
  ShieldAlert,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost, getErrorMessage } from '@/lib/api';
import type { Notification, PaginationMeta } from '@/lib/types';
import { cn, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const icons = {
  transaction: ReceiptText,
  low_balance: Wallet,
  login: LockKeyhole,
  security: ShieldAlert,
  welcome: Sparkles,
  bill: Landmark,
  loan: Landmark,
  card: CreditCard,
  support: BellRing,
} satisfies Record<Notification['type'], typeof Bell>;

const severityStyles: Record<Notification['severity'], string> = {
  info: 'bg-sky-50 text-sky-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
};

export function NotificationMenu() {
  const queryClient = useQueryClient();

  const notifications = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () =>
      apiGet<Notification[]>('/notifications', { limit: 6 }).then((response) => ({
        items: response.data,
        meta: response.meta as PaginationMeta,
      })),
  });

  const markAll = useMutation({
    mutationFn: () => apiPost<{ updated: number }>('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const markOne = useMutation({
    mutationFn: (id: string) => apiPost<Notification>(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const unread = notifications.data?.meta?.unread ?? 0;
  const items = notifications.data?.items ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-slate-900"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm text-slate-900">
            Notifications
          </DropdownMenuLabel>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              {markAll.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications
            </div>
          ) : notifications.isError ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Could not load notifications.
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-600">
                You are all caught up
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                New activity will appear here.
              </p>
            </div>
          ) : (
            items.map((notification) => {
              const Icon = icons[notification.type] ?? Bell;
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-none border-b border-slate-100 px-4 py-3 last:border-b-0',
                    !notification.isRead && 'bg-sky-50/50'
                  )}
                  onSelect={() => {
                    if (!notification.isRead) markOne.mutate(notification.id);
                  }}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      severityStyles[notification.severity]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium leading-snug text-slate-800">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="px-4 py-2.5 text-center text-xs text-muted-foreground">
          Showing your latest {items.length} notification{items.length === 1 ? '' : 's'}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
