// TODO: Implementar la lógica completa para la gestión de repartidores

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export default function RepartidoresManagement() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Gestión de Repartidores
          </CardTitle>
          <CardDescription>
            Administre los repartidores, asigne rutas y vea el historial de repartos. Esta sección está en construcción.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Próximamente: Funcionalidad para agregar, editar y eliminar repartidores, asignarles vehículos,
            zonas de reparto, y ver estadísticas de rendimiento.
          </p>
          {/* Aquí se agregarán tablas, formularios y otros componentes para la gestión de repartidores */}
        </CardContent>
      </Card>
    </div>
  );
}
