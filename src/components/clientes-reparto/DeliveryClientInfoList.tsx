
'use client';

import type { DeliveryClientInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteDeliveryClientInfoAction } from '@/app/actions';
import { Edit3, Trash2, ListChecks, Loader2, User, MapPin, Clock, DollarSign, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente interno para manejar la fecha de forma segura para la hidratación
const ClientSideFormattedDate = ({ dateString }: { dateString?: string | null }) => {
  const [displayText, setDisplayText] = useState<string>('...'); // Placeholder inicial, consistente en SSR y cliente

  useEffect(() => {
    // Este efecto solo se ejecuta en el cliente
    if (dateString) {
      try {
        const date = new Date(dateString); // Interpretado en la zona horaria del cliente
        setDisplayText(format(date, 'dd/MM/yyyy HH:mm', { locale: es }));
      } catch (error) {
        console.error("Error formatting date:", error);
        setDisplayText('Fecha inválida');
      }
    } else {
      setDisplayText('N/A');
    }
  }, [dateString]);

  return <>{displayText}</>;
};


interface DeliveryClientInfoListProps {
  deliveryClientInfos: DeliveryClientInfo[];
  onEdit: (info: DeliveryClientInfo) => void;
  onDeleteSuccess: () => void;
  isLoading?: boolean;
}

export default function DeliveryClientInfoList({ deliveryClientInfos, onEdit, onDeleteSuccess, isLoading: isListLoading }: DeliveryClientInfoListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (infoId: number, infoName: string) => {
    setDeletingId(infoId);
    try {
      const result = await deleteDeliveryClientInfoAction(infoId);
      if (result.success) {
        toast({
          title: 'Información Eliminada',
          description: `La información de cliente de reparto "${infoName}" ha sido eliminada.`,
        });
        onDeleteSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Error al eliminar la información.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al eliminar información de cliente de reparto:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Lista de Clientes para Reparto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isListLoading && (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Cargando información...</p>
            </div>
        )}
        {!isListLoading && deliveryClientInfos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <p>No se encontró información de clientes para reparto.</p>
            </div>
        )}
        {!isListLoading && deliveryClientInfos.length > 0 && (
          <Table>
            <TableCaption>Información detallada de clientes para operaciones de reparto.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead><User className="inline-block mr-1 h-4 w-4"/>Cliente Principal</TableHead>
                <TableHead>Nombre de Reparto</TableHead>
                <TableHead><MapPin className="inline-block mr-1 h-4 w-4"/>Dirección Reparto</TableHead>
                <TableHead><Phone className="inline-block mr-1 h-4 w-4"/>Teléfono Reparto</TableHead>
                <TableHead><Clock className="inline-block mr-1 h-4 w-4"/>Horario</TableHead>
                <TableHead><DollarSign className="inline-block mr-1 h-4 w-4"/>Tarifa</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryClientInfos.map((info) => (
                <TableRow key={info.id}>
                  <TableCell>{info.cliente_nombre || 'N/A'}</TableCell>
                  <TableCell className="font-medium">{info.nombre_reparto}</TableCell>
                  <TableCell>{info.direccion_reparto || 'N/A'}</TableCell>
                  <TableCell>{info.telefono_reparto || 'N/A'}</TableCell>
                  <TableCell>{info.rango_horario || 'N/A'}</TableCell>
                  <TableCell>{info.tarifa !== null && info.tarifa !== undefined ? `$${info.tarifa.toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell>
                    <ClientSideFormattedDate dateString={info.created_at} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(info)} disabled={deletingId === info.id}>
                      <Edit3 className="mr-1 h-4 w-4" />Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingId === info.id}>
                          {deletingId === info.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la información de reparto para "{info.nombre_reparto}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(info.id, info.nombre_reparto)} className="bg-destructive hover:bg-destructive/90">
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
