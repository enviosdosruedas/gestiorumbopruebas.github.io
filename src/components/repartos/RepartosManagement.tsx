
'use client';

import type { Reparto, Client, DeliveryPerson, Zona } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import RepartoForm from './RepartoForm';
import RepartoList from './RepartoList';
import { getRepartos as getRepartosAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Route, PackageCheck } from 'lucide-react';

interface RepartosManagementProps {
  initialRepartos: Reparto[];
  allClientes: Client[];
  allRepartidores: DeliveryPerson[];
  allZonas: Zona[]; // Added allZonas
}

export default function RepartosManagement({
  initialRepartos,
  allClientes,
  allRepartidores,
  allZonas // Destructure allZonas
}: RepartosManagementProps) {
  const [repartos, setRepartos] = useState<Reparto[]>(initialRepartos);
  const [editingReparto, setEditingReparto] = useState<Reparto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const refreshRepartos = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedRepartos = await getRepartosAction();
      setRepartos(updatedRepartos);
    } catch (error) {
      console.error("Failed to refresh repartos:", error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la lista de repartos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    setRepartos(initialRepartos);
  }, [initialRepartos]);

  const handleEdit = (reparto: Reparto) => {
    setEditingReparto(reparto);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = () => {
    setEditingReparto(null);
    refreshRepartos();
  };

  const handleCancelEdit = () => {
    setEditingReparto(null);
  };

  const handleDeleteSuccess = () => {
    refreshRepartos();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Card className="w-full shadow-md mb-8 bg-gradient-to-r from-primary/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
            <Route className="h-8 w-8" />
            <PackageCheck className="h-7 w-7 opacity-70" />
            Gestión de Repartos
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Cree, asigne y administre los repartos. Seleccione un repartidor, un cliente principal,
            zona, tanda y luego los puntos de entrega específicos para ese cliente.
          </CardDescription>
        </CardHeader>
      </Card>

      <RepartoForm
        key={editingReparto ? editingReparto.id : 'new-reparto-form'}
        initialData={editingReparto}
        allClientes={allClientes}
        allRepartidores={allRepartidores}
        allZonas={allZonas} // Pass allZonas
        onSuccess={handleFormSuccess}
        onCancel={editingReparto ? handleCancelEdit : undefined}
      />
      <Separator />
      <RepartoList
        repartos={repartos}
        onEdit={handleEdit}
        onDeleteSuccess={handleDeleteSuccess}
        isLoading={isLoading}
      />
    </div>
  );
}

    