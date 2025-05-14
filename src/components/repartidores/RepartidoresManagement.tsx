
'use client';

import type { DeliveryPerson } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import RepartidorForm from './RepartidorForm';
import RepartidorList from './RepartidorList';
import { getRepartidores as getRepartidoresAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Truck } from 'lucide-react';


interface RepartidoresManagementProps {
  initialRepartidores: DeliveryPerson[];
}

export default function RepartidoresManagement({ initialRepartidores }: RepartidoresManagementProps) {
  const [repartidores, setRepartidores] = useState<DeliveryPerson[]>(initialRepartidores);
  const [editingRepartidor, setEditingRepartidor] = useState<DeliveryPerson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const refreshRepartidores = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedRepartidores = await getRepartidoresAction();
      setRepartidores(updatedRepartidores);
    } catch (error) {
      console.error("Failed to refresh repartidores:", error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la lista de repartidores.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    setRepartidores(initialRepartidores);
  }, [initialRepartidores]);

  const handleEdit = (repartidor: DeliveryPerson) => {
    setEditingRepartidor(repartidor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = () => {
    setEditingRepartidor(null);
    refreshRepartidores();
  };

  const handleCancelEdit = () => {
    setEditingRepartidor(null);
  };

  const handleDeleteSuccess = () => {
    refreshRepartidores();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
       <Card className="w-full shadow-md mb-8 bg-gradient-to-r from-primary/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
            <Truck className="h-8 w-8" />
            Gestión de Repartidores
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Administre los repartidores, asigne vehículos y actualice su información de contacto.
            Las funcionalidades de asignación de rutas e historial de repartos se implementarán próximamente.
          </CardDescription>
        </CardHeader>
      </Card>

      <RepartidorForm
        key={editingRepartidor ? editingRepartidor.id : 'new-repartidor-form'}
        initialData={editingRepartidor}
        onSuccess={handleFormSuccess}
        onCancel={editingRepartidor ? handleCancelEdit : undefined}
      />
      <Separator />
      <RepartidorList
        repartidores={repartidores}
        onEdit={handleEdit}
        onDeleteSuccess={handleDeleteSuccess}
        isLoading={isLoading}
      />
    </div>
  );
}
