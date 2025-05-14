
'use client';

import type { DeliveryPerson, RepartidorFormData } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { repartidorSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addRepartidorAction, updateRepartidorAction } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Loader2, Save, PlusCircle, XCircle, UserPlus, Edit3 } from 'lucide-react';

interface RepartidorFormProps {
  initialData?: DeliveryPerson | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function RepartidorForm({ initialData, onSuccess, onCancel }: RepartidorFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RepartidorFormData>({
    resolver: zodResolver(repartidorSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      identificacion: initialData?.identificacion || '',
      telefono: initialData?.telefono || '',
      vehiculo: initialData?.vehiculo || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nombre: initialData.nombre,
        identificacion: initialData.identificacion || '',
        telefono: initialData.telefono || '',
        vehiculo: initialData.vehiculo || '',
      });
    } else {
      form.reset({ nombre: '', identificacion: '', telefono: '', vehiculo: '' });
    }
  }, [initialData, form]);
  
  const onSubmit = async (data: RepartidorFormData) => {
    setIsSubmitting(true);
    try {
      const result = initialData
        ? await updateRepartidorAction(initialData.id, data)
        : await addRepartidorAction(data);

      if (result.success && result.deliveryPerson) {
        toast({
          title: initialData ? 'Repartidor Actualizado' : 'Repartidor Agregado',
          description: `Repartidor ${result.deliveryPerson.nombre} ha sido ${initialData ? 'actualizado' : 'agregado'} exitosamente.`,
          variant: 'default',
        });
        onSuccess();
        form.reset({ nombre: '', identificacion: '', telefono: '', vehiculo: '' }); 
      } else {
        if (result.errors) {
          result.errors.forEach(err => {
            form.setError(err.path[0] as keyof RepartidorFormData, { message: err.message });
          });
        }
        toast({
          title: 'Error',
          description: result.message || `Error al ${initialData ? 'actualizar' : 'agregar'} repartidor.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error en envío de formulario de repartidor:', error);
      toast({
        title: 'Error',
        description: `Ocurrió un error inesperado. Por favor intente de nuevo.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {initialData ? <Edit3 className="h-6 w-6 text-primary" /> : <UserPlus className="h-6 w-6 text-primary" />}
          {initialData ? 'Editar Repartidor' : 'Agregar Nuevo Repartidor'}
        </CardTitle>
        <CardDescription>
          {initialData ? `Editando repartidor: ${initialData.nombre}` : 'Complete los detalles para agregar un nuevo repartidor.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del repartidor" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identificacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="DNI, CUIT, etc." {...field} value={field.value ?? ""} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de teléfono" {...field} value={field.value ?? ""} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehiculo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehículo (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Moto Honda Wave, Patente ABC 123" {...field} value={field.value ?? ""} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                initialData ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {initialData ? 'Guardar Cambios' : 'Agregar Repartidor'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
