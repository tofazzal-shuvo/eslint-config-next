import type { Order } from '@/types/order';
import { Button } from '@/components/ui/Button';
import { useOrders } from '../_hooks/useOrders';

type Props = { initialOrders: Order[]; onSelect: (id: string) => void };

export const OrderTable = ({ initialOrders, onSelect }: Props) => {
  const paidOrders = useOrders(initialOrders);

  return (
    <ul className="flex flex-col gap-2">
      {paidOrders.map((order) => (
        <li key={order.id}>
          <Button onClick={() => onSelect(order.id)}>{order.total}</Button>
        </li>
      ))}
    </ul>
  );
};
