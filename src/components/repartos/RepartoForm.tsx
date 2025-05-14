
'use client';

import type { Reparto, RepartoFormData, Client, DeliveryPerson, DeliveryClientInfo } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { repartoSchema, repartoEstados } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addRepartoAction, updateRepartoAction, getDeliveryClientInfosByClientId } from '@/app/actions';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, PlusCircle, XCircle, CalendarDays, User, Users, Package, ListChecks, AlertTriangle } from 'lucide-react';

interface RepartoFormProps {
  initialData?: Reparto | null;
  allClientes: Client[];
  allRepartidores: DeliveryPerson[];
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function RepartoForm({ initialData, allClientes, allRepartidores, onSuccess, onCancel }: RepartoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDeliveryClientInfos, setAvailableDeliveryClientInfos] = useState<DeliveryClientInfo[]>([]);
  const [isLoadingDCI, setIsLoadingDCI] = useState(false);

  const form = useForm<RepartoFormData>({
    resolver: zodResolver(repartoSchema),
    defaultValues: {
      fecha_reparto: initialData?.fecha_reparto ? new Date(initialData.fecha_reparto).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      repartidor_id: initialData?.repartidor_id || '',
      cliente_id: initialData?.cliente_id || '',
      selected_clientes_reparto_ids: initialData?.clientes_reparto_asignados?.map(dci => dci.id) || [],
      observaciones: initialData?.observaciones || '',
      estado: initialData?.estado || 'Asignado',
    },
  });

  const selectedClienteId = form.watch('cliente_id');

  const fetchDCIForCliente = useCallback(async (clienteId: string) => {
    if (!clienteId) {
      setAvailableDeliveryClientInfos([]);
      form.setValue('selected_clientes_reparto_ids', []); // Reset selection
      return;
    }
    setIsLoadingDCI(true);
    try {
      const dcis = await getDeliveryClientInfosByClientId(clienteId);
      setAvailableDeliveryClientInfos(dcis);
      // Si estamos editando y el cliente principal no ha cambiado, mantenemos la selección
      const currentSelection = initialData?.cliente_id === clienteId
        ? initialData?.clientes_reparto_asignados?.map(dci => dci.id) || []
        : [];
      form.setValue('selected_clientes_reparto_ids', currentSelection);
    } catch (error) {
      console.error("Error fetching delivery client infos for cliente:", error);
      setAvailableDeliveryClientInfos([]);
      form.setValue('selected_clientes_reparto_ids', []);
      toast({ title: "Error", description: "No se pudieron cargar los puntos de entrega para el cliente.", variant: "destructive" });
    } finally {
      setIsLoadingDCI(false);
    }
  }, [form, initialData, toast]);

  useEffect(() => {
    if (selectedClienteId) {
      fetchDCIForCliente(selectedClienteId);
    } else {
      setAvailableDeliveryClientInfos([]);
      form.setValue('selected_clientes_reparto_ids', []);
    }
  }, [selectedClienteId, fetchDCIForCliente, form]);


  useEffect(() => {
    if (initialData) {
      form.reset({
        fecha_reparto: initialData.fecha_reparto ? new Date(initialData.fecha_reparto).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        repartidor_id: initialData.repartidor_id || '',
        cliente_id: initialData.cliente_id || '',
        selected_clientes_reparto_ids: initialData.clientes_reparto_asignados?.map(dci => dci.id) || [],
        observaciones: initialData.observaciones || '',
        estado: initialData.estado || 'Asignado',
      });
      if (initialData.cliente_id) {
        fetchDCIForCliente(initialData.cliente_id);
      }
    } else {
      form.reset({
        fecha_reparto: new Date().toISOString().split('T')[0],
        repartidor_id: '',
        cliente_id: '',
        selected_clientes_reparto_ids: [],
        observaciones: '',
        estado: 'Asignado',
      });
      setAvailableDeliveryClientInfos([]);
    }
  }, [initialData, form, fetchDCIForCliente]);
  
  const onSubmit = async (data: RepartoFormData) => {
    setIsSubmitting(true);
    try {
      const result = initialData
        ? await updateRepartoAction(initialData.id, data)
        : await addRepartoAction(data);

      if (result.success && result.reparto) {
        toast({
          title: initialData ? 'Reparto Actualizado' : 'Reparto Agregado',
          description: `El reparto para el cliente ${result.reparto.cliente_principal_nombre || data.cliente_id} ha sido ${initialData ? 'actualizado' : 'agregado'} exitosamente.`,
        });
        onSuccess();
        form.reset(); 
      } else {
        if (result.errors) {
          result.errors.forEach(err => {
            form.setError(err.path[0] as keyof RepartoFormData, { message: err.message });
          });
        }
        toast({
          title: 'Error',
          description: result.message || `Error al ${initialData ? 'actualizar' : 'agregar'} el reparto.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error en envío de formulario de reparto:', error);
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
          {initialData ? 'Editar Reparto' : 'Crear Nuevo Reparto'}
        </CardTitle>
        <CardDescription>
          {initialData ? `Editando reparto ID: ${initialData.id}` : 'Complete los detalles para un nuevo reparto.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fecha_reparto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/>Fecha de Reparto</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repartidor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><User className="h-4 w-4"/>Repartidor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccione un repartidor" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allRepartidores.map((rp) => (
                          <SelectItem key={rp.id} value={rp.id}>{rp.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Users className="h-4 w-4"/>Cliente Principal</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset selected_clientes_reparto_ids when cliente_id changes
                      form.setValue('selected_clientes_reparto_ids', []); 
                    }} 
                    defaultValue={field.value} 
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione el cliente principal" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allClientes.map((cl) => (
                        <SelectItem key={cl.id} value={cl.id}>{cl.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedClienteId && (
              <FormItem>
                <FormLabel className="flex items-center gap-1"><ListChecks className="h-4 w-4"/>Puntos de Entrega para este Cliente</FormLabel>
                {isLoadingDCI && <Loader2 className="h-5 w-5 animate-spin my-2" />}
                {!isLoadingDCI && availableDeliveryClientInfos.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2 border border-dashed rounded-md flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    No hay puntos de entrega configurados para este cliente principal. Puede agregarlos en la sección "Clientes de Reparto".
                  </p>
                )}
                {!isLoadingDCI && availableDeliveryClientInfos.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {availableDeliveryClientInfos.map((dci) => (
                      <FormField
                        key={dci.id}
                        control={form.control}
                        name="selected_clientes_reparto_ids"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 hover:bg-muted/50 rounded-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(dci.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), dci.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== dci.id
                                          )
                                        );
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {dci.nombre_reparto} ({dci.direccion_reparto || 'Dirección no especificada'})
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
                 <FormMessage>{form.formState.errors.selected_clientes_reparto_ids?.message}</FormMessage>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Package className="h-4 w-4"/>Estado del Reparto</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {repartoEstados.map((estado) => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales sobre el reparto" {...field} value={field.value ?? ""} disabled={isSubmitting} />
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
            <Button type="submit" disabled={isSubmitting || (selectedClienteId && isLoadingDCI)}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                initialData ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {initialData ? 'Guardar Cambios' : 'Crear Reparto'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

