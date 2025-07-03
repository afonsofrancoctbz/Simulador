
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RocSection() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-card rounded-lg border shadow-lg p-8">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
            Registro em Órgão de Classe (ROC)
            </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Left Column */}
          <div className="md:col-span-1 bg-primary text-primary-foreground rounded-xl p-6 shadow-lg h-full flex flex-col justify-center">
            <ShieldCheck className="h-8 w-8 mb-4" />
            <p className="text-base text-primary-foreground/90">
              Se necessário, o Registro em Órgão de Classe da sua empresa será solicitado após a expedição do Alvará de Funcionamento.
            </p>
            <div className="mt-6 border-t border-primary-foreground/20 pt-4">
              <h4 className="font-bold">IMPORTANTE:</h4>
              <p className="mt-1 text-sm text-primary-foreground/90">
                Nem todos os CNAE's exigem registro. Verifique com sua Consultoria de Abertura.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Posso emitir notas fiscais sem o registro?
              </h3>
              <p className="mt-3 text-muted-foreground text-base">
                De acordo com a legislação, você pode emitir notas fiscais assim que o processo de abertura da sua empresa for finalizado.
              </p>
              <p className="mt-3 text-muted-foreground text-base">
                Caso a atividade da sua empresa exija o Registro em Órgão de Classe, orientamos que você aguarde até o protocolo ou a expedição deste documento, pois fica a critério de cada Conselho autuar ou não as emissões de notas que ocorram sem o mesmo.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  A Contabilizei cobra pela emissão do ROC?
                </h3>
                <p className="mt-3 text-muted-foreground text-base">
                  Não, a Contabilizei não cobra pelo serviço de solicitação do ROC. Porém, o órgão responsável pelo registro cobra uma taxa que deve ser paga por você.
                </p>
                <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-900">
                  <p className="font-bold">ATENÇÃO:</p>
                  <p>
                    A Contabilizei não faz a renovação anual do ROC, que fica sob sua responsabilidade, de acordo com a validade do seu registro.
                  </p>
                </div>
                <p className="mt-4 text-muted-foreground text-base">
                  Verifique com sua Consultoria de Abertura sobre valores e tempo médio de emissão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
