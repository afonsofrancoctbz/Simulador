"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Calculator, Milestone, Award, Wallet, Building, ShieldCheck, Sparkles, Handshake, HelpCircle, Info } from 'lucide-react';

const navItems = [
    { id: 'tax-calculator', title: 'Simulador', icon: Calculator },
    { id: 'opening-steps', title: 'Etapas da Abertura', icon: Milestone },
    { id: 'digital-certificate', title: 'Certificado Digital', icon: Award },
    { id: 'roc', title: 'Registro de Classe', icon: Award },
    { id: 'pj-account', title: 'Conta PJ', icon: Wallet },
    { id: 'capital-social', title: 'Capital Social', icon: Building },
    { id: 'health-benefits', title: 'Planos de Saúde', icon: ShieldCheck },
    { id: 'multibenefits-section', title: 'Benefícios', icon: Sparkles },
    { id: 'socii-law', title: 'Parceria Jurídica', icon: Handshake },
    { id: 'faq', title: 'FAQ', icon: HelpCircle },
];

export default function FloatingNav() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        if (section) {
          if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  const renderNavLinks = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map(item => (
        <Button
          key={item.id}
          asChild
          variant="ghost"
          className={cn(
            'w-full justify-start text-base',
            activeSection === item.id ? 'bg-accent text-accent-foreground' : ''
          )}
          onClick={handleLinkClick}
        >
          <Link href={`#${item.id}`} className="flex items-center gap-3">
             <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 print-hidden">
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full shadow-lg h-14 w-14">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Navegação Rápida</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {renderNavLinks()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
