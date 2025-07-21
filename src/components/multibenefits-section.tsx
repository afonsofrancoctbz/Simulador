import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, Dumbbell, Monitor, AlertTriangle } from 'lucide-react';

const coreBenefits = [
    {
        icon: Dumbbell,
        title: "Acesso a academias",
        description: "Mais de 20 mil para você escolher.",
    },
    {
        icon: Monitor,
        title: "Consultas online",
        description: "Psicólogos e nutricionistas prontos para te atender.",
    }
];

const partnerBenefits = [
    {
        partnerLogo: "https://www.contabilizei.com.br/_mobile/img/totalpass.af4e579.webp",
        partnerAlt: "Logo TotalPass",
        title: "Fitness com TotalPass",
        description: "Você e 1 sócio + 1 dependente cada têm acesso ao TotalPass, um benefício exclusivamente corporativo de saúde e bem-estar. Dentro do app, você pode contratar planos de academias e estúdios por valores bem abaixo do mercado. São mais de 10 planos disponíveis para escolher o que mais combina com você! Escolha entre mais de 20 mil academias e mais de 250 modalidades.",
    },
    {
        partnerLogo: "https://www.contabilizei.com.br/_mobile/img/starbem.99ab037.webp",
        partnerAlt: "Logo StarBem",
        title: "Bem-estar com StarBem",
        description: "Telemedicina para você + 1 sócio. Acesse a plataforma StarBem e aproveite 4 consultas online com psicólogos e 1 com nutricionista por mês, além de exames e descontos em medicamentos em laboratórios e farmácias parceiras.",
        details: [
            "10% de desconto nos laboratórios LabiExames;",
            "Até 15% de desconto nos laboratórios dos grupos Dasa, A+, Sabin e Hermes Pardini;",
            "Até 26% de desconto em medicamentos genéricos e até 13% em medicamentos de marca na Droga Raia e Drogasil."
        ]
    }
];


export default function MultibenefitsSection() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-16 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                    Seu CNPJ nunca teve tantos benefícios
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Abra sua empresa hoje mesmo com o Multibenefícios, o plano da Contabilizei que traz o suporte que o empreendedor precisa, sem abrir mão dos benefícios que ele merece.
                </p>
            </div>

            {/* Core Benefits Icons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16 text-center sm:text-left">
                {coreBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <benefit.icon className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">{benefit.title}</h3>
                            <p className="text-base text-muted-foreground">{benefit.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Partner Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
                 {/* TotalPass Card */}
                <Card className="flex flex-col text-left overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-card">
                    <CardHeader>
                        <Image src={partnerBenefits[0].partnerLogo} alt="" width={120} height={40} className="mb-4" />
                        <CardTitle className="text-2xl font-bold text-primary">{partnerBenefits[0].title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-base text-muted-foreground">{partnerBenefits[0].description}</p>
                    </CardContent>
                </Card>

                 {/* StarBem Card */}
                <Card className="flex flex-col text-left overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-card">
                    <CardHeader>
                         <Image src={partnerBenefits[1].partnerLogo} alt="" width={120} height={40} className="mb-4" />
                        <CardTitle className="text-2xl font-bold text-primary">{partnerBenefits[1].title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <p className="text-base text-muted-foreground">{partnerBenefits[1].description}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {partnerBenefits[1].details?.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span>{detail}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            
            {/* Important Info Alert */}
            <div className="max-w-4xl mx-auto space-y-4">
                 <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-900">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="font-semibold">IMPORTANTE</AlertTitle>
                    <AlertDescription>
                       Para adquirir o Multibenefícios é cobrado um valor de R$30,00 a mais na mensalidade. Se contratar o plano de saúde com a Contabilizei, não há cobrança deste valor adicional.
                       <span className="block mt-2 text-xs opacity-80">*Assim que seu CNPJ for emitido, você receberá as instruções para assinar o contrato digitalmente.</span>
                    </AlertDescription>
                </Alert>
            </div>
            
            {/* CTA Button */}
            <div className="text-center">
                 <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7 px-10">
                    GARANTIR MEUS BENEFÍCIOS AGORA
                </Button>
            </div>
        </div>
    );
}
