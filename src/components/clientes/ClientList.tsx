
'use client';

import type { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteClientAction } from '@/app/actions';
import { Edit, Trash2, ListChecks, Loader2, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDeleteSuccess: () => void;
  isLoading?: boolean;
}

export default function ClientList({ clients, onEdit, onDeleteSuccess, isLoading: isListLoading }: ClientListProps) {
  const { toast } = useToast();
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const handleDelete = async (clientId: string) => {
    setDeletingClientId(clientId);
    try {
      const result = await deleteClientAction(clientId);
      if (result.success) {
        toast({
          title: 'Cliente Eliminado',
          description: 'El cliente ha sido eliminado exitosamente.',
        });
        onDeleteSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Error al eliminar el cliente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado al eliminar el cliente.',
        variant: 'destructive',
      });
    } finally {
      setDeletingClientId(null);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Lista de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isListLoading && (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Cargando clientes...</p>
            </div>
        )}
        {!isListLoading && clients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <p>No se encontraron clientes. Agregue un nuevo cliente para comenzar.</p>
            </div>
        )}
        {!isListLoading && clients.length > 0 && (
          <Table>
            <TableCaption>Una lista de sus clientes.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead><><Phone className="inline-block mr-1 h-4 w-4"/>Teléfono</></TableHead>
                <TableHead><><Mail className="inline-block mr-1 h-4 w-4"/>Email</></TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.address || 'N/A'}</TableCell>
                  <TableCell>{client.telefono || 'N/A'}</TableCell>
                  <TableCell>{client.email || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(client)} disabled={deletingClientId === client.id}>
                      <Edit className="mr-1 h-4 w-4" />Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingClientId === client.id}>
                          {deletingClientId === client.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el cliente "{client.name}" y todos los datos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(client.id)} className="bg-destructive hover:bg-destructive/90">
                            Sí, eliminar cliente
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
