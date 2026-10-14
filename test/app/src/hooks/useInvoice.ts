import type { Order } from '@/types/order';
import { invoiceTotal } from '@/features/billing/utils/invoiceTotal';

export const useInvoice = (orders: Order[]) => invoiceTotal(orders);
