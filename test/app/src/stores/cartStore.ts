import type { Order } from '@/types/order';

export const createCartStore = (orders: Order[]) => ({ orders, count: orders.length });
