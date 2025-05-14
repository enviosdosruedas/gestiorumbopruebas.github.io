// TODO: Implementar la lógica completa para la gestión de clientes de reparto

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, MapPin } from 'lucide-react';

export default function ClientesRepartoManagement() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <MapPin className="h-5 w-5 text-primary/80" />
            Clientes de Reparto
          </CardTitle>
          <CardDescription>
            Administre los clientes recurrentes para servicios de reparto, sus direcciones de entrega,
            horarios preferidos y tarifas especiales. Esta sección está en construcción.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Próximamente: Funcionalidad para agregar, editar y eliminar clientes de reparto,
            gestionar múltiples direcciones por cliente, definir tarifas personalizadas y
            ver historial de servicios.
          </p>
          {/* Aquí se agregarán tablas, formularios y otros componentes para la gestión de clientes de reparto */}
        </CardContent>
      </Card>
    </div>
  );
}
