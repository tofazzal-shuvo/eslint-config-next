import { InvoiceSummary } from '@/features/billing/components/InvoiceSummary';
import { ThemeProvider } from '@/providers/ThemeProvider';

export default function BillingPage() {
  return (
    <ThemeProvider>
      <InvoiceSummary orders={[]} />
    </ThemeProvider>
  );
}
