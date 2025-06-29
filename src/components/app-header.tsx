import Image from 'next/image';

export default function AppHeader() {
  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Image
          src="https://www.contabilizei.com.br/_mobile/img/logo-contabilizei.edac969.svg"
          alt="Logo Contabilizei"
          width={180}
          height={30}
          priority
        />
      </div>
    </header>
  );
}
