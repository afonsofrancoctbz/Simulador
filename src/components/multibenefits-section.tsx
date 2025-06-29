import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Car, CreditCard, GraduationCap, HeartPulse, Home, Soup, Ticket, UtensilsCrossed } from "lucide-react";

const benefits = [
    { icon: HeartPulse, label: "Saúde" },
    { icon: UtensilsCrossed, label: "Alimentação" },
    { icon: Soup, label: "Refeição" },
    { icon: Ticket, label: "Cultura" },
    { icon: Home, label: "Home office" },
    { icon: GraduationCap, label: "Educação" },
    { icon: Car, label: "Mobilidade" },
    { icon: CreditCard, label: "Crédito" },
];

export default function MultibenefitsSection() {
    return (
        <div className="w-full max-w-7xl mx-auto">
            <Card className="bg-card shadow-lg overflow-hidden border">
                <div className="grid md:grid-cols-2 items-center">
                    <div className="p-8 md:p-12 space-y-6">
                        <Badge variant="outline" className="text-primary border-primary/50">Exclusivo Contabilizei</Badge>
                        <CardTitle className="text-3xl font-bold text-foreground">
                           Conheça o plano Multibenefícios: contabilidade com benefícios que cuidam de você e do seu negócio
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Ofereça um pacote de benefícios flexíveis para seus colaboradores com o cartão Caju, aceito em mais de 4 milhões de estabelecimentos, e simplifique a gestão de benefícios da sua empresa.
                        </CardDescription>
                        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                            Saiba mais sobre o Multibenefícios
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="bg-primary/5 p-8 md:p-12 h-full flex flex-col justify-center">
                        <h3 className="text-lg font-semibold text-foreground mb-6 text-center">Um único cartão, 8 categorias de benefícios:</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex flex-col items-center space-y-2">
                                    <div className="w-16 h-16 rounded-lg bg-background border flex items-center justify-center">
                                        <benefit.icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{benefit.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
