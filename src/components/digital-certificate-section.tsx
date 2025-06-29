
import { AlertCircle } from 'lucide-react';

export default function DigitalCertificateSection() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-card rounded-lg border shadow-lg p-8">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-accent">
                Certificado digital
              </h2>
              <p className="mt-2 text-muted-foreground text-lg">
                Todos os clientes Contabilizei precisam de um certificado digital e-CNPJ (A1), independente do regime tributário que são enquadrados.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Para que serve um certificado digital?
                </h3>
                <ul className="mt-3 space-y-3 text-muted-foreground text-base">
                  <li>O certificado funciona como uma assinatura digital para documentos online.</li>
                  <li>Ele também pode comprovar a identidade da sua empresa, com validade jurídica.</li>
                  <li>É obrigatório para a emissão de notas fiscais e para que a Contabilizei seja responsável pela entrega das suas declarações (exigências da Receita Federal).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Emita sem custos!
                </h3>
                <p className="mt-2 text-muted-foreground text-base">
                  Aqui na Contabilizei você pode emitir seu certificado e renová-lo anualmente, sem custo.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-lg h-full flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6" />
              <h4 className="text-xl font-bold">IMPORTANTE</h4>
            </div>
            <p className="mt-4 text-base text-primary-foreground/90">
              A não aquisição e upload do certificado digital na plataforma da Contabilizei pode impedir nossa equipe de entregar as obrigações de sua empresa, o que pode gerar multas mensais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
