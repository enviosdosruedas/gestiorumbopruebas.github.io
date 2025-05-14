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
  const [addressValidationStatus, setAddressValidationStatus] = useState<{isValid: boolean, message?: string} | null>(null);


  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientCode: initialClientData?.clientCode || '',
      name: initialClientData?.name || '',
      address: initialClientData?.address || '',
    },
  });

  useEffect(() => {
    if (initialClientData) {
      form.reset({
        clientCode: initialClientData.clientCode,
        name: initialClientData.name,
        address: initialClientData.address,
      });
      if (initialClientData.isAddressValid !== undefined) {
         setAddressValidationStatus({
            isValid: !!initialClientData.isAddressValid,
            message: initialClientData.isAddressValid ? `Validated: ${initialClientData.validatedAddress}` : "Previous address was not valid in Mar del Plata."
         });
      } else {
        setAddressValidationStatus(null);
      }
    } else {
      form.reset({ clientCode: '', name: '', address: '' });
      setAddressValidationStatus(null);
    }
  }, [initialClientData, form]);
  
  const handleAddressValidated = (isValid: boolean, validatedAddress?: string) => {
    if (isValid) {
        setAddressValidationStatus({ isValid: true, message: `Address appears valid: ${validatedAddress || form.getValues("address")}` });
    } else {
        setAddressValidationStatus({ isValid: false, message: "Address may not be valid or not in Mar del Plata." });
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    setAddressValidationStatus(null); // Clear previous validation message

    try {
      const result = initialClientData
        ? await updateClientAction(initialClientData.id, data)
        : await addClientAction(data);

      if (result.success && result.client) {
        toast({
          title: initialClientData ? 'Client Updated' : 'Client Added',
          description: `Client ${result.client.name} has been successfully ${initialClientData ? 'updated' : 'added'}.`,
          variant: 'default',
        });
        onSuccess();
        form.reset({ clientCode: '', name: '', address: '' }); // Reset form after successful submission
      } else {
        // Display server-side validation errors or general message
        if (result.errors) {
          result.errors.forEach(err => {
            form.setError(err.path[0] as keyof ClientFormData, { message: err.message });
          });
        }
        toast({
          title: 'Error',
          description: result.message || `Failed to ${initialClientData ? 'update' : 'add'} client. Please check the form.`,
          variant: 'destructive',
        });
        // Set specific address validation message from server if available, related to AI check
        if(result.client && result.client.isAddressValid === false) {
            setAddressValidationStatus({ isValid: false, message: result.client.validatedAddress || "Address not valid in Mar del Plata." });
        } else if (result.client && result.client.isAddressValid === true && result.client.validatedAddress) {
            setAddressValidationStatus({ isValid: true, message: `Validated: ${result.client.validatedAddress}`});
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: `An unexpected error occurred. Please try again.`,
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
          {initialClientData ? 'Edit Client' : 'Add New Client'}
        </CardTitle>
        <CardDescription>
          {initialClientData ? `Editing client: ${initialClientData.name}` : 'Fill in the details to add a new client.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="clientCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., C001" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client's full name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <AddressAutocompleteInput
                      {...field}
                      onAddressValidated={handleAddressValidated}
                      className="w-full"
                    />
                  </FormControl>
                  {addressValidationStatus && (
                    <p className={`text-sm mt-1 ${addressValidationStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {addressValidationStatus.message}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                initialClientData ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {initialClientData ? 'Save Changes' : 'Add Client'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
