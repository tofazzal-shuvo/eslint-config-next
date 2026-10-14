type OrderStatus = 'paid' | 'pending' | 'failed';

declare function redirect(url: string): never;

export const redirectFor = (status: OrderStatus) => {
  switch (status) {
    case 'paid':
      redirect('/orders/paid');
    case 'pending':
      redirect('/orders/pending');
    case 'failed':
      redirect('/orders');
  }
};
