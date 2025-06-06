
'use client';

import type { Client, ClientFormData } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AddressAutocompleteInput } from '@/components/clientes/AddressAutocompleteInput';
import { useToast } from '@/hooks/use-toast';
import { addClientAction, updateClientAction } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Loader2, Save, PlusCircle, XCircle } from 'lucide-react';

interface ClientFormProps {
  initialClientData?: Client | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function ClientForm({ initialClientData, onSuccess, onCancel }: ClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressValidationUIMessage, setAddressValidationUIMessage] = useState<string | null>(null);


  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombre: initialClientData?.nombre || '',
      direccion: initialClientData?.direccion || '',
      telefono: initialClientData?.telefono || '',
      email: initialClientData?.email || '',
    },
  });

  useEffect(() => {
    if (initialClientData) {
      form.reset({
        nombre: initialClientData.nombre,
        direccion: initialClientData.direccion || '',
        telefono: initialClientData.telefono || '',
        email: initialClientData.email || '',
      });
    } else {
      form.reset({ nombre: '', direccion: '', telefono: '', email: '' });
    }
    setAddressValidationUIMessage(null); 
  }, [initialClientData, form]);
  
  const handleAddressValidated = (isValid: boolean, validatedAddress?: string) => {
    if (isValid) {
        setAddressValidationUIMessage(`Dirección parece válida: ${validatedAddress || form.getValues("direccion")}`);
    } else {
        setAddressValidationUIMessage("Dirección podría no ser válida o no estar en Mar del Plata.");
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    setAddressValidationUIMessage(null); 

    try {
      const result = initialClientData
        ? await updateClientAction(initialClientData.id, data)
        : await addClientAction(data);

      if (result.success && result.client) {
        toast({
          title: initialClientData ? 'Cliente Actualizado' : 'Cliente Agregado',
          description: `Cliente ${result.client.nombre} ha sido ${initialClientData ? 'actualizado' : 'agregado'} exitosamente.`,
          variant: 'default',
        });
        onSuccess();
        form.reset({ nombre: '', direccion: '', telefono: '', email: '' }); 
      } else {
        if (result.errors) {
          result.errors.forEach(err => {
            form.setError(err.path[0] as keyof ClientFormData, { message: err.message });
          });
        }
        toast({
          title: 'Error',
          description: result.message || `Error al ${initialClientData ? 'actualizar' : 'agregar'} cliente. Verifique los datos o inténtelo más tarde.`,
          variant: 'destructive',
        });
        
        if (result.addressValidation) {
            if (result.addressValidation.isValid) {
                 setAddressValidationUIMessage(`IA validó la dirección: ${result.addressValidation.suggestions?.[0] || data.direccion}`);
            } else {
                 setAddressValidationUIMessage(`IA sugiere: ${result.addressValidation.suggestions?.join(', ') || 'Dirección podría no ser válida o no estar en Mar del Plata.'}`);
            }
        }
      }
    } catch (error) {
      console.error('Error en envío de formulario:', error);
      toast({
        title: 'Error Inesperado',
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
          {initialClientData ? <Save className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
          {initialClientData ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
        </CardTitle>
        <CardDescription>
          {initialClientData ? `Editando cliente: ${initialClientData.nombre}` : 'Complete los detalles para agregar un nuevo cliente.'}
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
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo del cliente" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <AddressAutocompleteInput
                      value={field.value || ''} // Ensure value is not null for AddressAutocompleteInput
                      onChange={field.onChange}
                      onAddressValidated={handleAddressValidated}
                      className="w-full"
                    />
                  </FormControl>
                  {addressValidationUIMessage && (
                    <p className={`text-sm mt-1 ${addressValidationUIMessage.startsWith("Dirección parece válida") || addressValidationUIMessage.startsWith("IA validó la dirección") ? 'text-green-600' : 'text-red-600'}`}>
                      {addressValidationUIMessage}
                    </p>
                  )}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="correo@ejemplo.com" {...field} value={field.value ?? ""} disabled={isSubmitting} />
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
                initialClientData ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {initialClientData ? 'Guardar Cambios' : 'Agregar Cliente'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

