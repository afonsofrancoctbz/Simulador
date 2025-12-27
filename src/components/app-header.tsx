import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';

export default function AppHeader() {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 print:hidden shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="https://www.contabilizei.com.br/_mobile/img/logo-contabilizei.edac969.svg"
            alt="Logo Contabilizei"
            width={160}
            height={35}
            priority
          />
        </Link>
        
        {/* Navegação Superior (A Seleção) */}
        <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild className="text-[#002855] hover:text-[#00d3b3] hover:bg-transparent font-semibold text-sm">
                <Link href="/">Calculadora de Impostos</Link>
            </Button>
            <Button variant="ghost" asChild className="text-[#002855] hover:text-[#00d3b3] hover:bg-transparent font-semibold text-sm">
                <Link href="/A Vida Com CNPJ">A Vida Com CNPJ</Link>
            </Button>
            <Button variant="ghost" asChild className="text-[#002855] hover:text-[#00d3b3] hover:bg-transparent font-semibold text-sm">
                <Link href="/fator-r">Análise Fator R</Link>
            </Button>
            <Button variant="ghost" asChild className="text-[#002855] hover:text-[#00d3b3] hover:bg-transparent font-semibold text-sm">
                <Link href="/custo-funcionario">Custo do Funcionário</Link>
            </Button>
            <Button variant="ghost" asChild className="text-[#002855] hover:text-[#00d3b3] hover:bg-transparent font-semibold text-sm">
                <Link href="/playbook">Playbook do Empreendedor</Link>
            </Button>
        </nav>

        {/* Menu Mobile (Opcional - caso precise) */}
        <div className="md:hidden text-[#002855]">
            <span className="font-bold text-sm">Menu</span>
        </div>
      </div>
    </header>
  );
}
