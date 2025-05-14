
'use client';

import type { Reparto, RepartoFormData, Client, DeliveryPerson, DeliveryClientInfo, Zona, DetalleRepartoFormData } from '@/types';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { repartoSchema } from '@/lib/schema';
import { ALL_REPARTO_STATUSES } from '@/types'; // Corrected import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { addRepartoAction, updateRepartoAction, getDeliveryClientInfosByClientId } from '@/app/actions';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, PlusCircle, XCircle, CalendarDays, User, Users, Package, ListChecks, AlertTriangle, Map, Clock4, Trash, DollarSign, NotebookPen } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RepartoFormProps {
  initialData?: Reparto | null;
  allClientes: Client[];
  allRepartidores: DeliveryPerson[];
  allZonas: Zona[];
  onSuccess: () => void;
  onCancel?: () => void;
}

const NO_CLIENTE_PRINCIPAL_VALUE = "___NO_CLIENTE_PRINCIPAL___";

export default function RepartoForm({ initialData, allClientes, allRepartidores, allZonas, onSuccess, onCancel }: RepartoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDeliveryClientInfos, setAvailableDeliveryClientInfos] = useState<DeliveryClientInfo[]>([]);
  const [isLoadingDCI, setIsLoadingDCI] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.fecha_reparto ? parseISO(initialData.fecha_reparto) : new Date()
  );

  const form = useForm<RepartoFormData>({
    resolver: zodResolver(repartoSchema),
    defaultValues: {
      fecha_reparto: initialData?.fecha_reparto ? format(parseISO(initialData.fecha_reparto), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      repartidor_id: initialData?.repartidor_id || '',
      cliente_id: initialData?.cliente_id || null,
      zona_id: initialData?.zona_id?.toString() || '',
      tanda: initialData?.tanda || 1,
      // selected_clientes_reparto_ids: [], // This will be replaced by 'detalles_reparto'
      detalles_reparto: initialData?.detalles_reparto?.map(dr => ({
        cliente_reparto_id: dr.cliente_reparto_id.toString(),
        valor_entrega: dr.valor_entrega,
        detalle_entrega: dr.detalle_entrega,
      })) || [],
      observaciones: initialData?.observaciones || '',
      estado: initialData?.estado || 'pendiente',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles_reparto"
  });

  const selectedClientePrincipalId = form.watch('cliente_id');

  const fetchDCIForCliente = useCallback(async (clienteId: string | null) => {
    if (!clienteId || clienteId === NO_CLIENTE_PRINCIPAL_VALUE) {
      setAvailableDeliveryClientInfos([]);
      form.setValue('detalles_reparto', []); // Clear items if no client or general delivery
      return;
    }
    setIsLoadingDCI(true);
    try {
      const dcis = await getDeliveryClientInfosByClientId(clienteId);
      setAvailableDeliveryClientInfos(dcis);
      // Preserve existing details if editing and client hasn't changed, or clear them
      if (initialData?.cliente_id !== clienteId) {
        form.setValue('detalles_reparto', []);
      }
    } catch (error) {
      console.error("Error fetching delivery client infos for cliente:", error);
      setAvailableDeliveryClientInfos([]);
      form.setValue('detalles_reparto', []);
      toast({ title: "Error", description: "No se pudieron cargar los puntos de entrega para el cliente.", variant: "destructive" });
    } finally {
      setIsLoadingDCI(false);
    }
  }, [form, initialData, toast]);

  useEffect(() => {
    fetchDCIForCliente(selectedClientePrincipalId);
  }, [selectedClientePrincipalId, fetchDCIForCliente]);


  useEffect(() => {
    if (initialData) {
      setSelectedDate(parseISO(initialData.fecha_reparto));
      form.reset({
        fecha_reparto: format(parseISO(initialData.fecha_reparto), 'yyyy-MM-dd'),
        repartidor_id: initialData.repartidor_id || '',
        cliente_id: initialData.cliente_id || null,
        zona_id: initialData.zona_id?.toString() || '',
        tanda: initialData.tanda || 1,
        detalles_reparto: initialData.detalles_reparto?.map(dr => ({
          cliente_reparto_id: dr.cliente_reparto_id.toString(),
          valor_entrega: dr.valor_entrega,
          detalle_entrega: dr.detalle_entrega,
        })) || [],
        observaciones: initialData.observaciones || '',
        estado: initialData.estado || 'pendiente',
      });
    } else {
      const today = new Date();
      setSelectedDate(today);
      form.reset({
        fecha_reparto: format(today, 'yyyy-MM-dd'),
        repartidor_id: '',
        cliente_id: null,
        zona_id: '',
        tanda: 1,
        detalles_reparto: [],
        observaciones: '',
        estado: 'pendiente',
      });
    }
  }, [initialData, form]);
  
  const onSubmit = async (data: RepartoFormData) => {
    setIsSubmitting(true);
    
    const dataToSubmit = {
      ...data,
      cliente_id: data.cliente_id === NO_CLIENTE_PRINCIPAL_VALUE ? null : data.cliente_id,
      tanda: Number(data.tanda), 
      detalles_reparto: data.detalles_reparto.map(d => ({
        ...d,
        // cliente_reparto_id is already a string, no conversion needed here
      })),
    };

    try {
      const result = initialData
        ? await updateRepartoAction(initialData.id, dataToSubmit)
        : await addRepartoAction(dataToSubmit);

      if (result.success && result.reparto) {
        toast({
          title: initialData ? 'Reparto Actualizado' : 'Reparto Creado',
          description: `El reparto ha sido ${initialData ? 'actualizado' : 'creado'} exitosamente.`,
        });
        onSuccess();
        form.reset(); 
      } else {
        if (result.errors) {
          result.errors.forEach(err => {
            // For nested errors in detalles_reparto
            if (err.path.length > 1 && err.path[0] === 'detalles_reparto') {
              form.setError(`detalles_reparto.${err.path[1]}.${err.path[2]}` as any, { message: err.message });
            } else {
              form.setError(err.path[0] as keyof RepartoFormData, { message: err.message });
            }
          });
        }
        toast({
          title: 'Error',
          description: result.message || `Error al ${initialData ? 'actualizar' : 'crear'} el reparto.`,
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="fecha_reparto"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/>Fecha de Reparto</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                          >
                            {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                            <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) field.onChange(format(date, 'yyyy-MM-dd'));
                          }}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // No permitir fechas pasadas
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
               <FormField
                control={form.control}
                name="zona_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Map className="h-4 w-4"/>Zona</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccione una zona" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allZonas.map((zona) => (
                          <SelectItem key={zona.id} value={zona.id.toString()}>{zona.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tanda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Clock4 className="h-4 w-4"/>Tanda</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 1)} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        {ALL_REPARTO_STATUSES.map((estado) => ( // Corrected usage
                          <SelectItem key={estado} value={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</SelectItem>
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
                      field.onChange(value === NO_CLIENTE_PRINCIPAL_VALUE ? null : value);
                    }} 
                    value={field.value === null ? NO_CLIENTE_PRINCIPAL_VALUE : field.value || undefined} 
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione el cliente principal" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CLIENTE_PRINCIPAL_VALUE}>Sin cliente principal (Reparto General)</SelectItem>
                      {allClientes.map((cl) => (
                        <SelectItem key={cl.id} value={cl.id}>{cl.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedClientePrincipalId && selectedClientePrincipalId !== NO_CLIENTE_PRINCIPAL_VALUE && (
              <Card className="pt-4">
                <CardHeader className="p-2 pt-0">
                  <CardTitle className="text-lg">Ítems de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-2">
                  {isLoadingDCI && <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <span className="ml-2">Cargando puntos de entrega...</span></div>}
                  {!isLoadingDCI && availableDeliveryClientInfos.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2 border border-dashed rounded-md flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      No hay puntos de entrega configurados para este cliente principal. Puede agregarlos en "Clientes de Reparto".
                    </p>
                  )}
                  {!isLoadingDCI && availableDeliveryClientInfos.length > 0 && fields.map((item, index) => (
                    <div key={item.id} className="p-3 border rounded-md space-y-3 relative bg-muted/20">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => remove(index)} disabled={isSubmitting}>
                         <Trash className="h-4 w-4" /> <span className="sr-only">Eliminar ítem</span>
                       </Button>
                      <FormField
                        control={form.control}
                        name={`detalles_reparto.${index}.cliente_reparto_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Punto de Entrega</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Seleccione un punto de entrega" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableDeliveryClientInfos.map(dci => (
                                  <SelectItem key={dci.id} value={dci.id.toString()}>{dci.nombre_reparto} ({dci.direccion_reparto || 'N/A'})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`detalles_reparto.${index}.valor_entrega`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1"><DollarSign className="h-4 w-4"/>Valor a Cobrar (ARS)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} 
                                 value={field.value === null || field.value === undefined ? '' : String(field.value)}
                                 onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                 disabled={isSubmitting}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`detalles_reparto.${index}.detalle_entrega`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1"><NotebookPen className="h-4 w-4"/>Notas de Entrega</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: Dejar en portería" {...field} value={field.value ?? ""} disabled={isSubmitting}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {!isLoadingDCI && availableDeliveryClientInfos.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ cliente_reparto_id: '', valor_entrega: null, detalle_entrega: '' })} disabled={isSubmitting || isLoadingDCI}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ítem de Entrega
                    </Button>
                  )}
                  <FormMessage>{form.formState.errors.detalles_reparto?.root?.message || form.formState.errors.detalles_reparto?.message}</FormMessage>
                </CardContent>
              </Card>
            )}
            
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones Generales del Reparto (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales sobre el reparto completo" {...field} value={field.value ?? ""} disabled={isSubmitting} />
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
            <Button type="submit" disabled={isSubmitting || isLoadingDCI}>
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

    