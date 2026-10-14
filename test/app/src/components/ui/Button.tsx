import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = { children: ReactNode; isActive?: boolean; onClick: () => void };

export const Button = ({ children, isActive = false, onClick }: Props) => (
  <button type="button" className={cn('rounded-md px-3 py-2', isActive && 'bg-blue-600 text-white')} onClick={onClick}>
    {children}
  </button>
);
