'use client';

import { cookies } from 'next/headers';

export const ClientBadge = () => <span className="text-sm">{String(cookies) + (process.env.API_TOKEN ?? '')}</span>;
