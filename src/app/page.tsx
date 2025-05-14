import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bienvenido a Rumbo Envios',
  description: 'Página de inicio de Rumbo Envios Client Management',
};

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center"> {/* Adjust min-h to account for header */}
      <h1 className="text-4xl font-bold mb-6 text-primary">
        Bienvenido a Rumbo Envios
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
        Optimice la gestión de sus clientes de manera eficiente y centralizada. Acceda a todas las herramientas necesarias para mantener su base de datos de clientes actualizada y organizada.
      </p>
      <Link href="/Clientes">
        <Button size="lg" className="px-8 py-6 text-lg">
          Ir a Gestión de Clientes
        </Button>
      </Link>
    </div>
  );
}
