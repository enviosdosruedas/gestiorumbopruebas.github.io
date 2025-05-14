
'use client';

import type { Reparto } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge, badgeVariants } from "@/components/ui/badge"; // Import badgeVariants
import { useToast } from '@/hooks/use-toast';
import { deleteRepartoAction } from '@/app/actions';
import { Edit3, Trash2, PackageSearch, Loader2, CalendarDays, User, Users, Info, Map, Clock4, ListChecks, FileText, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import type { VariantProps } from 'class-variance-authority';

const ClientSideFormattedDate = ({ dateString, formatString = 'PPP' }: { dateString?: string | null, formatString?: string }) => {
  const [displayText, setDisplayText] = useState<string>('...');
  useEffect(() => {
    if (dateString) {
      try {
        const date = parseISO(dateString); 
        setDisplayText(format(date, formatString, { locale: es }));
      } catch (error) {
        try {
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

interface RepartoListProps {
  repartos: Reparto[];
  onEdit: (reparto: Reparto) => void;
  onDeleteSuccess: () => void;
  isLoading?: boolean;
}

export default function RepartoList({ repartos, onEdit, onDeleteSuccess, isLoading: isListLoading }: RepartoListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (repartoId: number) => {
    setDeletingId(repartoId);
    try {
      const result = await deleteRepartoAction(repartoId);
      if (result.success) {
        toast({
          title: 'Reparto Eliminado',
          description: 'El reparto ha sido eliminado exitosamente.',
        });
        onDeleteSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Error al eliminar el reparto.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al eliminar reparto:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado al eliminar el reparto.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusVariant = (status: string | null): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status?.toLowerCase()) {
      case "pendiente":
        return "pendiente";
      case "en curso":
        return "en-curso";
      case "entregado":
        return "entregado";
      case "cancelado":
        return "cancelado";
      case "reprogramado":
        return "reprogramado";
      default:
        return "outline";
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageSearch className="h-6 w-6 text-primary" />
          Lista de Repartos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isListLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Cargando repartos...</p>
          </div>
        )}
        {!isListLoading && repartos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron repartos. Agregue uno nuevo para comenzar.</p>
          </div>
        )}
        {!isListLoading && repartos.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Lista de todos los repartos programados y completados.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead><CalendarDays className="inline-block mr-1 h-4 w-4"/>Fecha</TableHead>
                  <TableHead><User className="inline-block mr-1 h-4 w-4"/>Repartidor</TableHead>
                  <TableHead><Users className="inline-block mr-1 h-4 w-4"/>Cliente Principal</TableHead>
                  <TableHead><Map className="inline-block mr-1 h-4 w-4"/>Zona</TableHead>
                  <TableHead><Clock4 className="inline-block mr-1 h-4 w-4"/>Tanda</TableHead>
                  <TableHead><ListChecks className="inline-block mr-1 h-4 w-4"/>N° Items</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead><Info className="inline-block mr-1 h-4 w-4"/>Obs.</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repartos.map((reparto) => (
                  <TableRow key={reparto.id}>
                    <TableCell>
                      <ClientSideFormattedDate dateString={reparto.fecha_reparto} formatString="PPP"/>
                    </TableCell>
                    <TableCell>{reparto.repartidor_nombre || 'N/A'}</TableCell>
                    <TableCell>{reparto.cliente_principal_nombre || 'Reparto General'}</TableCell>
                    <TableCell>{reparto.zona_nombre || 'N/A'}</TableCell>
                    <TableCell>{reparto.tanda || 'N/A'}</TableCell>
                    <TableCell>{reparto.item_count ?? (reparto.detalles_reparto?.length || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(reparto.estado)}>{reparto.estado || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={reparto.observaciones || undefined}>
                      {reparto.observaciones || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-1 md:space-x-2">
                       <Link href={`/Repartos/${reparto.id}/report`} passHref>
                        <Button variant="outline" size="sm" title="Ver Reporte">
                           <Eye className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Reporte</span>
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => onEdit(reparto)} disabled={deletingId === reparto.id} title="Editar Reparto">
                        <Edit3 className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Editar</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={deletingId === reparto.id} title="Eliminar Reparto">
                            {deletingId === reparto.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 md:mr-1" />}
                            <span className="hidden md:inline">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el reparto del <ClientSideFormattedDate dateString={reparto.fecha_reparto} formatString="PPP" /> para el cliente {reparto.cliente_principal_nombre || 'General'}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(reparto.id)} className="bg-destructive hover:bg-destructive/90">
                              Sí, eliminar reparto
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    
