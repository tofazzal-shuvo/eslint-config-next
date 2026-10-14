import type { Order } from '@/types/order';
import { invoiceTotal } from '../utils/invoiceTotal';

type Props = { orders: Order[] };

export const InvoiceSummary = ({ orders }: Props) => <p className="text-sm">{invoiceTotal(orders)}</p>;
