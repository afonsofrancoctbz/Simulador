import { Scale } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Scale className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-headline text-card-foreground">
          TributaSimples
        </h1>
      </div>
    </header>
  );
}
