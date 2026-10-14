import { cn } from '@/lib/utils';

export const CardHeading = () => <h2 className={cn('leading-none text-base text-gray-900')}>Orders</h2>;

export const PriceLabel = () => <p className={cn('text-[15px] text-gray-900')}>Total</p>;

export const OrderIcon = () => <span className={cn('h-4 w-4')}>i</span>;
