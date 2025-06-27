import TaxCalculator from '@/components/tax-calculator';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <TaxCalculator />
    </div>
  );
}
