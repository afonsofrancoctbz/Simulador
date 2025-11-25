import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';

export default function AppHeader() {
  return (
    <header className="bg-card border-b sticky top-0 z-40 print-hidden">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src="https://www.contabilizei.com.br/_mobile/img/logo-contabilizei.edac969.svg"
            alt="Logo Contabilizei"
            width={180}
            height={30}
            priority
          />
        </Link>
        <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/">Calculadora de Impostos</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/fator-r">Análise Fator R</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/custo-funcionario">Custo do Funcionário</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/playbook">Playbook do Empreendedor</Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
