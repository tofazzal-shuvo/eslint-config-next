import { OrderTable } from './_components/OrderTable';
import type { OrderFilter } from './_types';

const DEFAULT_FILTER: OrderFilter = 'all';

export default function OrdersPage() {
  return <OrderTable initialOrders={[]} onSelect={() => DEFAULT_FILTER} />;
}
