import 'server-only';

export const databaseUrl = () => process.env.DATABASE_URL ?? '';
