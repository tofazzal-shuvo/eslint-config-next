import { OrderTable } from '../_components/OrderTable';

export default function OrderPage() {
  return <OrderTable initialOrders={[]} onSelect={() => undefined} />;
}
