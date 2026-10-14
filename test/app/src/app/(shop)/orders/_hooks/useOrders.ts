import { useState } from 'react';
import type { Order } from '@/types/order';

export const useOrders = (initialOrders: Order[]) => {
  const [orders] = useState(initialOrders);
  return orders.filter((order) => order.isPaid);
};
