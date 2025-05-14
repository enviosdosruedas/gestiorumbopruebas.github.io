
'use client';

import type { DeliveryClientInfo, DeliveryClientInfoFormData, Client } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deliveryClientInfoSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addDeliveryClientInfoAction, updateDeliveryClientInfoAction } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Loader2, Save, PlusCircle, XCircle, UserCheck, MapPin, Clock, DollarSign, Phone } from 'lucide-react';

interface DeliveryClientInfoFormProps {
  initialData?: DeliveryClientInfo | null;
  allClients: Client[];
  onSuccess: () => void;
  onCancel?: () => void;
}

// Helper para parsear el string de rango_horario
const parseRangoHorario = (rango: string | null | undefined): { desde: string, hasta: string } => {
  if (!rango || typeof rango !== 'string') return { desde: '', hasta: '' };
  const parts = rango.split(' - ');
  if (parts.length === 2) {
    return { desde: parts[0].trim(), hasta: parts[1].trim() };
  }
  // Manejar otros formatos si es necesario, o si solo hay una hora
  if (rango.toLowerCase().startsWith('desde ')) {
    return { desde: rango.substring(6).trim(), hasta: '' };
  }
  if (rango.toLowerCase().startsWith('hasta ')) {
    return { desde: '', hasta: rango.substring(6).trim() };
  }
  // Si no se puede parsear bien, devolver vacío o el string original en un campo si es necesario
  return { desde: '', hasta: '' }; 
};


export default function DeliveryClientInfoForm({ initialData, allClients, onSuccess, onCancel }: DeliveryClientInfoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialHorario = initialData?.rango_horario ? parseRangoHorario(initialData.rango_horario) : { desde: '', hasta: '' };

  const form = useForm<DeliveryClientInfoFormData>({
    resolver: zodResolver(deliveryClientInfoSchema),
    defaultValues: {
      cliente_id: initialData?.cliente_id || '',
      nombre_reparto: initialData?.nombre_reparto || '',
      direccion_reparto: initialData?.direccion_reparto || '',
      rango_horario_desde: initialHorario.desde,
      rango_horario_hasta: initialHorario.hasta,
      tarifa: initialData?.tarifa === null || initialData?.tarifa === undefined ? undefined : initialData.tarifa,
      telefono_reparto: initialData?.telefono_reparto || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      const horario = parseRangoHorario(initialData.rango_horario);
      form.reset({
        cliente_id: initialData.cliente_id,
        nombre_reparto: initialData.nombre_reparto,
        direccion_reparto: initialData.direccion_reparto || '',
        rango_horario_desde: horario.desde,
        rango_horario_hasta: horario.hasta,
        tarifa: initialData.tarifa === null || initialData.tarifa === undefined ? undefined : initialData.tarifa,
        telefono_reparto: initialData.telefono_reparto || '',
      });
    } else {
      form.reset({ 
        cliente_id: '', 
        nombre_reparto: '', 
        direccion_reparto: '', 
        rango_horario_desde: '',
        rango_horario_hasta: '',
        tarifa: undefined, 
        telefono_reparto: '' 
      });
    }
  }, [initialData, form]);
  
  const onSubmit = async (data: DeliveryClientInfoFormData) => {
    setIsSubmitting(true);
    try {
      const result = initialData
        // El tipo de `data` aquí ya es DeliveryClientInfoFormData que incluye desde/hasta
        ? await updateDeliveryClientInfoAction(initialData.id, data) 
        : await addDeliveryClientInfoAction(data);

      if (result.success && result.deliveryClientInfo) {
        toast({
          title: initialData ? 'Información Actualizada' : 'Información Agregada',
          description: `La información para ${result.deliveryClientInfo.nombre_reparto} ha sido ${initialData ? 'actualizada' : 'agregada'} exitosamente.`,
        });
        onSuccess();
        form.reset({ cliente_id: '', nombre_reparto: '', direccion_reparto: '', rango_horario_desde: '', rango_horario_hasta: '', tarifa: undefined, telefono_reparto: '' }); 
      } else {
        if (result.errors) {
          result.errors.forEach(err => {
            form.setError(err.path[0] as keyof DeliveryClientInfoFormData, { message: err.message });
          });
        }
        toast({
          title: 'Error',
          description: result.message || `Error al ${initialData ? 'actualizar' : 'agregar'} información.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error en envío de formulario de cliente de reparto:', error);
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
          {initialData ? <Save className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
          {initialData ? 'Editar Cliente de Reparto' : 'Agregar Nuevo Cliente de Reparto'}
        </CardTitle>
        <CardDescription>
          {initialData ? `Editando información para: ${initialData.nombre_reparto}` : 'Complete los detalles para un nuevo cliente de reparto.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><UserCheck className="h-4 w-4"/>Cliente Principal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un cliente existente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombre_reparto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Referencia para Reparto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Oficina Central, Depósito Sur" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="direccion_reparto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><MapPin className="h-4 w-4"/>Dirección Específica de Reparto (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Si es diferente a la dirección principal del cliente" {...field} value={field.value ?? ""} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono_reparto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Phone className="h-4 w-4"/>Teléfono de Contacto para Reparto (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono específico para esta entrega" {...field} value={field.value ?? ""} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="rango_horario_desde"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Clock className="h-4 w-4"/>Horario Desde (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value ?? ""} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rango_horario_hasta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Clock className="h-4 w-4"/>Horario Hasta (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value ?? ""} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

             <FormField
              control={form.control}
              name="tarifa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><DollarSign className="h-4 w-4"/>Tarifa Especial (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Dejar vacío para tarifa estándar" {...field} 
                           value={field.value === null || field.value === undefined ? '' : String(field.value)}
                           onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                           disabled={isSubmitting} />
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
              {initialData ? 'Guardar Cambios' : 'Agregar Info Cliente Reparto'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
