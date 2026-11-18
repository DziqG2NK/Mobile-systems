import { createContext, ReactNode, RefObject, useContext, useRef } from 'react';

export type LeaveGuard = (proceed: () => void) => void;

const LeaveGuardContext = createContext<RefObject<LeaveGuard | null> | null>(null);

export function LeaveGuardProvider({ children }: { children: ReactNode }) {
  const guardRef = useRef<LeaveGuard | null>(null);
  return <LeaveGuardContext.Provider value={guardRef}>{children}</LeaveGuardContext.Provider>;
}

export function useLeaveGuard() {
  const ctx = useContext(LeaveGuardContext);
  if (!ctx) throw new Error('useLeaveGuard must be used inside <LeaveGuardProvider>');
  return ctx;
}
