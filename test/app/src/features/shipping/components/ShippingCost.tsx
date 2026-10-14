import type { Order } from '@/types/order';
import { invoiceTotal } from '@/features/billing/utils/invoiceTotal';

type Props = { orders: Order[] };

export const ShippingCost = ({ orders }: Props) => <p className="text-sm">{invoiceTotal(orders) / 10}</p>;
