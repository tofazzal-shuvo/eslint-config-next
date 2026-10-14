import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export const ThemeProvider = ({ children }: Props) => <div className="min-h-screen">{children}</div>;
