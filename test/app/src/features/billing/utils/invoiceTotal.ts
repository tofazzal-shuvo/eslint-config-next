import type { Order } from '@/types/order';

export const invoiceTotal = (orders: Order[]) => orders.reduce((sum, order) => sum + order.total, 0);
