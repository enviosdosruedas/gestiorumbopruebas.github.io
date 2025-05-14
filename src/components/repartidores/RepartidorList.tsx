
'use client';

import type { DeliveryPerson } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteRepartidorAction } from '@/app/actions';
import { Edit3, Trash2, Users, Loader2, Phone, ShieldCheck, Bike } from 'lucide-react';
import { useState } from 'react';

interface RepartidorListProps {
  repartidores: DeliveryPerson[];
  onEdit: (repartidor: DeliveryPerson) => void;
  onDeleteSuccess: () => void;
  isLoading?: boolean;
}

export default function RepartidorList({ repartidores, onEdit, onDeleteSuccess, isLoading: isListLoading }: RepartidorListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (repartidorId: string, repartidorName: string) => {
    setDeletingId(repartidorId);
    try {
      const result = await deleteRepartidorAction(repartidorId);
      if (result.success) {
        toast({
          title: 'Repartidor Eliminado',
          description: `El repartidor ${repartidorName} ha sido eliminado exitosamente.`,
        });
        onDeleteSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Error al eliminar el repartidor.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al eliminar repartidor:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado al eliminar el repartidor.',
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
          <Users className="h-6 w-6 text-primary" />
          Lista de Repartidores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isListLoading && (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Cargando repartidores...</p>
            </div>
        )}
        {!isListLoading && repartidores.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <p>No se encontraron repartidores. Agregue uno nuevo para comenzar.</p>
            </div>
        )}
        {!isListLoading && repartidores.length > 0 && (
          <Table>
            <TableCaption>Una lista de sus repartidores.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead><ShieldCheck className="inline-block mr-1 h-4 w-4"/>Identificación</TableHead>
                <TableHead><Phone className="inline-block mr-1 h-4 w-4"/>Teléfono</TableHead>
                <TableHead><Bike className="inline-block mr-1 h-4 w-4"/>Vehículo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repartidores.map((repartidor) => (
                <TableRow key={repartidor.id}>
                  <TableCell className="font-medium">{repartidor.nombre}</TableCell>
                  <TableCell>{repartidor.identificacion || 'N/A'}</TableCell>
                  <TableCell>{repartidor.telefono || 'N/A'}</TableCell>
                  <TableCell>{repartidor.vehiculo || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(repartidor)} disabled={deletingId === repartidor.id}>
                      <Edit3 className="mr-1 h-4 w-4" />Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingId === repartidor.id}>
                          {deletingId === repartidor.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el repartidor "{repartidor.nombre}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(repartidor.id, repartidor.nombre)} className="bg-destructive hover:bg-destructive/90">
                            Sí, eliminar repartidor
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
