"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function TaxReformInfoSection() {
  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <Card className="shadow-lg border-primary/20 bg-primary/5">
        <CardHeader className="text-center">
          <Info className="mx-auto h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold text-primary">
            Informações sobre a Reforma Tributária
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            A seção de informações sobre a reforma tributária está sendo atualizada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
