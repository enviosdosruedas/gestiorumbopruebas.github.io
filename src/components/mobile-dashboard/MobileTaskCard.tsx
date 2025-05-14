
'use client';

import type { MobileDashboardTask, DetalleRepartoStatus } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Phone, Info, CheckCircle, PlayCircle, Navigation, AlertTriangle, XCircle, Loader2, DollarSign } from 'lucide-react';
import React, { useState } from 'react';
import MobileTaskDetailsDialog from './MobileTaskDetailsDialog'; // Assuming this will be created
import { useToast } from '@/hooks/use-toast';
import { updateDetalleRepartoStatusAction } from '@/app/actions';
import type { VariantProps } from 'class-variance-authority';

interface MobileTaskCardProps {
  task: MobileDashboardTask;
  driverId: string; // For context if needed for actions
}

const getStatusBadgeVariant = (status?: DetalleRepartoStatus): VariantProps<typeof badgeVariants>["variant"] => {
  switch (status) {
    case 'pendiente': return 'pendiente';
    case 'en_camino': return 'en-curso';
    case 'entregado': return 'entregado';
    case 'no_entregado': return 'destructive'; // Using destructive for not delivered
    case 'cancelado': return 'cancelado';
    default: return 'outline';
  }
};

const getStatusText = (status?: DetalleRepartoStatus): string => {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'en_camino': return 'En Camino';
    case 'entregado': return 'Entregado';
    case 'no_entregado': return 'No Entregado';
    case 'cancelado': return 'Cancelado';
    default: return 'Desconocido';
  }
}

export default function MobileTaskCard({ task, driverId }: MobileTaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();

  const handleNavigate = () => {
    if (task.cliente_reparto_direccion) {
      const mapsUrl = \`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(task.cliente_reparto_direccion)}\`;
      window.open(mapsUrl, '_blank');
    } else {
      toast({ title: "Error", description: "No hay dirección para navegar.", variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (newStatus: DetalleRepartoStatus) => {
    setIsUpdatingStatus(true);
    try {
      const result = await updateDetalleRepartoStatusAction(task.id, newStatus);
      if (result.success && result.updatedTask) {
        toast({ title: "Estado Actualizado", description: \`Entrega marcada como \${getStatusText(newStatus)}.\` });
        // Parent component will re-fetch and re-render, or we can update local state if needed.
      } else {
        toast({ title: "Error", description: result.message || "No se pudo actualizar el estado.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error de conexión al actualizar.", variant: "destructive" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  const renderActionButtons = () => {
    switch (task.estado_entrega) {
      case 'pendiente':
        return (
          <>
            <Button size="sm" onClick={handleNavigate} className="flex-1 bg-blue-500 hover:bg-blue-600">
              <Navigation className="mr-1.5 h-4 w-4" /> Navegar
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('en_camino')} className="flex-1" disabled={isUpdatingStatus}>
              {isUpdatingStatus ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/> : <PlayCircle className="mr-1.5 h-4 w-4" />} Iniciar
            </Button>
          </>
        );
      case 'en_camino':
        return (
          <>
            <Button size="sm" onClick={handleNavigate} className="flex-1 bg-blue-500 hover:bg-blue-600">
              <Navigation className="mr-1.5 h-4 w-4" /> Navegar
            </Button>
            <Button size="sm" onClick={() => handleStatusUpdate('entregado')} className="flex-1 bg-green-500 hover:bg-green-600" disabled={isUpdatingStatus}>
             {isUpdatingStatus ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-1.5 h-4 w-4" />} Entregado
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate('no_entregado')} className="flex-1" disabled={isUpdatingStatus}>
              {isUpdatingStatus ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/> : <XCircle className="mr-1.5 h-4 w-4" />} No Entreg.
            </Button>
          </>
        );
      case 'entregado':
      case 'no_entregado':
      case 'cancelado':
        return null; // No primary actions for completed/cancelled tasks on the card itself
      default:
        return null;
    }
  };


  return (
    <>
      <Card className="overflow-hidden shadow-sm bg-card">
        <CardHeader className="p-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-semibold leading-tight">{task.cliente_reparto_nombre || 'Destinatario Desconocido'}</CardTitle>
            <Badge variant={getStatusBadgeVariant(task.estado_entrega)} className="text-xs whitespace-nowrap">
              {getStatusText(task.estado_entrega)}
            </Badge>
          </div>
          {task.cliente_reparto_direccion && (
            <CardDescription className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" /> {task.cliente_reparto_direccion}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-3 text-xs space-y-1.5">
          {task.cliente_reparto_horario_preferido && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> <span>Horario: {task.cliente_reparto_horario_preferido}</span>
            </div>
          )}
          {task.cliente_reparto_telefono && (
             <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> <span>Tel: {task.cliente_reparto_telefono}</span>
            </div>
          )}
           {task.valor_entrega !== null && task.valor_entrega !== undefined && task.valor_entrega > 0 && (
            <div className="flex items-center gap-1.5 font-medium text-green-600">
              <DollarSign className="h-3.5 w-3.5" /> <span>Cobrar: ${task.valor_entrega.toFixed(2)}</span>
            </div>
          )}
          {task.detalle_entrega && (
             <div className="flex items-start gap-1.5 text-muted-foreground pt-1">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span>Notas: {task.detalle_entrega}</span>
            </div>
          )}
        </CardContent>
        <Separator />
        <CardFooter className="p-2 space-x-2 flex justify-between">
          <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(true)} className="flex-1 text-xs">
            Ver Detalles
          </Button>
          <div className="flex-1 flex gap-2">
            {renderActionButtons()}
          </div>
        </CardFooter>
      </Card>
      <MobileTaskDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={task}
      />
    </>
  );
}
