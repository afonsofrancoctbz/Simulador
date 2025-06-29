
'use client';

import { useState, useEffect } from 'react';

export default function AppFooter() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-6 mt-12 text-center text-sm text-muted-foreground">
      <p>TributaSimples © {year}.</p>
      <p className="text-xs mt-2">Aviso: Esta ferramenta destina-se apenas a fins de estimativa. Consulte um contador para aconselhamento preciso.</p>
    </footer>
  );
}
