import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Literata } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const literata = Literata({ subsets: ["latin"], variable: "--font-serif"});

export const metadata: Metadata = {
  title: 'TributaSimples | Calculadora de Impostos',
  description: 'Calculadora de Impostos para Prestadores de Serviço',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${inter.variable} ${literata.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
