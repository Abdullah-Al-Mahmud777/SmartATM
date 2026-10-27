'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatTimeLeft } from '@/lib/utils';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const WARNING_MS = 60 * 1000;
const CHECK_INTERVAL_MS = 1000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'pointerdown',
  'keydown',
  'touchstart',
  'wheel',
];

export function SessionTimeout({ onExpire }: { onExpire: () => void }) {
  const lastActivity = useRef(0);
  const expiring = useRef(false);
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(WARNING_MS / 1000));

  const staySignedIn = useCallback(() => {
    lastActivity.current = Date.now();
    setWarning(false);
    setSecondsLeft(Math.round(WARNING_MS / 1000));
  }, []);

  useEffect(() => {
    if (!lastActivity.current) lastActivity.current = Date.now();
    const registerActivity = () => {
      if (!warning) lastActivity.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, registerActivity, { passive: true })
    );
    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, registerActivity)
      );
    };
  }, [warning]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        if (!expiring.current) {
          expiring.current = true;
          onExpire();
        }
        return;
      }
      if (idleFor >= IDLE_TIMEOUT_MS - WARNING_MS) {
        const remaining = Math.max(
          0,
          Math.ceil((IDLE_TIMEOUT_MS - idleFor) / 1000)
        );
        setSecondsLeft(remaining);
        setWarning(true);
      }
    }, CHECK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [onExpire]);

  return (
    <Dialog open={warning} onOpenChange={(open) => !open && staySignedIn()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock3 className="h-5 w-5" />
          </div>
          <DialogTitle>Still there?</DialogTitle>
          <DialogDescription>
            For your security, you will be signed out after a period of inactivity.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <div className="text-2xl font-bold tabular-nums text-amber-700">
            {formatTimeLeft(secondsLeft)}
          </div>
          <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-amber-600">
            until automatic sign-out
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={staySignedIn} className="w-full sm:w-auto">
            Stay signed in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
