import type {Metadata} from 'next';
import './globals.css';
import './print.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: 'Simulador Tributario - Afonso Franco | Calculadora Inteligente de Impostos',
  description: 'Calculadora de Impostos para Prestadores de Serviço',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${inter.variable}`}>
        <div id="print-portal-root" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
