
'use client';

import type { DeliveryClientInfo, Client } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import DeliveryClientInfoForm from './DeliveryClientInfoForm';
import DeliveryClientInfoList from './DeliveryClientInfoList';
import { getDeliveryClientInfos, getClients } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList, Route } from 'lucide-react';

interface ClientesRepartoManagementProps {
  initialDeliveryClientInfos: DeliveryClientInfo[];
  allClients: Client[];
}

export default function ClientesRepartoManagement({ initialDeliveryClientInfos, allClients }: ClientesRepartoManagementProps) {
  const [deliveryClientInfos, setDeliveryClientInfos] = useState<DeliveryClientInfo[]>(initialDeliveryClientInfos);
  const [editingInfo, setEditingInfo] = useState<DeliveryClientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const refreshDeliveryClientInfos = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedInfos = await getDeliveryClientInfos();
      setDeliveryClientInfos(updatedInfos);
    } catch (error) {
      console.error("Failed to refresh delivery client infos:", error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la lista de clientes de reparto.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    setDeliveryClientInfos(initialDeliveryClientInfos);
  }, [initialDeliveryClientInfos]);

  const handleEdit = (info: DeliveryClientInfo) => {
    setEditingInfo(info);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = () => {
    setEditingInfo(null);
    refreshDeliveryClientInfos();
  };

  const handleCancelEdit = () => {
    setEditingInfo(null);
  };

  const handleDeleteSuccess = () => {
    refreshDeliveryClientInfos();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Card className="w-full shadow-md mb-8 bg-gradient-to-r from-primary/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-primary">
            <ClipboardList className="h-8 w-8" />
            <Route className="h-7 w-7 opacity-70" />
            Gestión de Clientes de Reparto
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Administre los clientes recurrentes para servicios de reparto, sus direcciones de entrega,
            horarios preferidos y tarifas especiales.
          </CardDescription>
        </CardHeader>
      </Card>

      <DeliveryClientInfoForm
        key={editingInfo ? editingInfo.id : 'new-delivery-client-info-form'}
        initialData={editingInfo}
        allClients={allClients}
        onSuccess={handleFormSuccess}
        onCancel={editingInfo ? handleCancelEdit : undefined}
      />
      <Separator />
      <DeliveryClientInfoList
        deliveryClientInfos={deliveryClientInfos}
        onEdit={handleEdit}
        onDeleteSuccess={handleDeleteSuccess}
        isLoading={isLoading}
      />
    </div>
  );
}
