
'use client';

import type { MobileDashboardTask } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Phone, Info, Package, DollarSign, CalendarDays, User, StickyNote } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import React from 'react';

interface MobileTaskDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: MobileDashboardTask | null;
}

const ClientSideFormattedDate = ({ dateString, formatString = 'PPP' }: { dateString?: string | null, formatString?: string }) => {
  const [displayText, setDisplayText] = React.useState<string>('...'); 
  React.useEffect(() => {
    if (dateString) {
      try {
        const date = parseISO(dateString); 
        setDisplayText(format(date, formatString, { locale: es }));
      } catch (error) {
         try { // Fallback for "dd/MM/yyyy" format or similar if parseISO fails
            const directDate = new Date(dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3')); 
            setDisplayText(format(directDate, formatString, { locale: es }));
        } catch (innerError) {
            console.error("Error formatting date:", innerError);
            setDisplayText('Fecha inválida');
        }
      }
    } else {
      setDisplayText('N/A');
    }
  }, [dateString, formatString]);
  return <>{displayText}</>;
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
};

const getStatusText = (status?: string): string => {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'en_camino': return 'En Camino';
    case 'entregado': return 'Entregado';
    case 'no_entregado': return 'No Entregado';
    case 'cancelado': return 'Cancelado';
    default: return 'Desconocido';
  }
}

export default function MobileTaskDetailsDialog({ isOpen, onOpenChange, task }: MobileTaskDetailsDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Detalles de Entrega
          </DialogTitle>
          <DialogDescription>
            ID Tarea: {task.id} - Cliente: {task.cliente_reparto_nombre || 'N/A'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="p-4 space-y-3 text-sm">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">{getStatusText(task.estado_entrega)}</Badge>
            </div>

            <h3 className="font-semibold text-base mt-2">Información del Destinatario</h3>
            <div className="pl-2 space-y-1">
              <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {task.cliente_reparto_nombre || 'N/A'}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {task.cliente_reparto_direccion || 'N/A'}</p>
              {task.cliente_reparto_telefono && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {task.cliente_reparto_telefono}</p>}
              {task.cliente_reparto_horario_preferido && <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Horario: {task.cliente_reparto_horario_preferido}</p>}
            </div>

            <h3 className="font-semibold text-base mt-3">Detalles de la Entrega</h3>
             <div className="pl-2 space-y-1">
              {task.valor_entrega !== null && task.valor_entrega !== undefined && (
                <p className="flex items-center gap-2 font-medium"><DollarSign className="h-4 w-4 text-green-600" /> Valor a Cobrar: {formatCurrency(task.valor_entrega)}</p>
              )}
              {task.detalle_entrega && <p className="flex items-start gap-2"><StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" /> Notas Específicas: {task.detalle_entrega}</p>}
            </div>
            
            <h3 className="font-semibold text-base mt-3">Información del Reparto General</h3>
            <div className="pl-2 space-y-1">
                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /> Fecha Reparto: <ClientSideFormattedDate dateString={task.reparto_fecha} /></p>
                {task.reparto_observaciones && <p className="flex items-start gap-2"><Info className="h-4 w-4 text-muted-foreground mt-0.5" /> Obs. Generales: {task.reparto_observaciones}</p>}
            </div>

            <p className="text-xs text-muted-foreground pt-2">Orden de Visita: {task.orden_visita + 1}</p>

          </div>
        </ScrollArea>
        
        <DialogFooter className="p-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
