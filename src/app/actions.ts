
'use server';

import type { Client, ClientFormData } from '@/types';
import { validateAddress, type ValidateAddressOutput } from '@/ai/flows/validate-address';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { clientSchema } from '@/lib/schema';
import { supabase } from '@/lib/supabaseClient';

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clientes') // Changed from 'clients'
    .select('id, nombre, direccion, telefono, email') // Explicitly select columns
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Supabase getClients error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch clients.');
  }
  // Map to domain model, address can be null
  return data.map(client => ({
    id: client.id,
    name: client.nombre,
    address: client.direccion, // direccion can be null
    telefono: client.telefono,
    email: client.email,
  })) as Client[];
}

export async function addClientAction(formData: ClientFormData): Promise<{ success: boolean; client?: Client; errors?: z.ZodIssue[]; message?: string; addressValidation?: ValidateAddressOutput }> {
  const validationResult = clientSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { name, address, telefono, email } = validationResult.data;
  
  let validatedAddressInfo: ValidateAddressOutput | undefined;
  try {
    validatedAddressInfo = await validateAddress({ address });
  } catch (error) {
    console.error('AI Address Validation Error:', error);
  }

  const clientDataToInsert = {
    nombre: name, // Changed from name
    direccion: address, // Changed from address
    telefono: telefono || null,
    email: email || null,
  };

  const { data: newClientRecord, error: insertError } = await supabase
    .from('clientes') // Changed from 'clients'
    .insert(clientDataToInsert)
    .select('id, nombre, direccion, telefono, email') // Explicitly select columns
    .single();

  if (insertError) {
    console.error('Supabase addClient error:', insertError.message || JSON.stringify(insertError));
    return { success: false, message: 'Failed to add client to database.', addressValidation: validatedAddressInfo };
  }

  revalidatePath('/Clientes');
  return { 
    success: true, 
    client: {
      id: newClientRecord.id,
      name: newClientRecord.nombre,
      address: newClientRecord.direccion,
      telefono: newClientRecord.telefono,
      email: newClientRecord.email,
    } as Client,
    addressValidation: validatedAddressInfo
  };
}

export async function updateClientAction(id: string, formData: ClientFormData): Promise<{ success: boolean; client?: Client; errors?: z.ZodIssue[]; message?: string; addressValidation?: ValidateAddressOutput }> {
  const validationResult = clientSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { name, address, telefono, email } = validationResult.data;
  
  const { data: clientToUpdate, error: findError } = await supabase
    .from('clientes') // Changed from 'clients'
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !clientToUpdate) {
    console.error('Supabase find client for update error:', findError ? (findError.message || JSON.stringify(findError)) : 'Client not found');
    return { success: false, message: 'Client not found.' };
  }
  
  let validatedAddressInfo: ValidateAddressOutput | undefined;
  try {
    validatedAddressInfo = await validateAddress({ address });
  } catch (error) {
    console.error('AI Address Validation Error:', error);
  }
  
  const clientDataToUpdate = {
    nombre: name, // Changed from name
    direccion: address, // Changed from address
    telefono: telefono || null,
    email: email || null,
    // updated_at is not managed by client if not in table or no trigger
  };

  const { data: updatedClientRecord, error: updateError } = await supabase
    .from('clientes') // Changed from 'clients'
    .update(clientDataToUpdate)
    .eq('id', id)
    .select('id, nombre, direccion, telefono, email') // Explicitly select columns
    .single();

  if (updateError) {
    console.error('Supabase updateClient error:', updateError.message || JSON.stringify(updateError));
    return { success: false, message: 'Failed to update client in database.', addressValidation: validatedAddressInfo };
  }
  
  revalidatePath('/Clientes');
  return { 
    success: true, 
    client: {
      id: updatedClientRecord.id,
      name: updatedClientRecord.nombre,
      address: updatedClientRecord.direccion,
      telefono: updatedClientRecord.telefono,
      email: updatedClientRecord.email,
    } as Client,
    addressValidation: validatedAddressInfo
  };
}

export async function deleteClientAction(id: string): Promise<{ success: boolean; message?: string }> {
  const { error: deleteError } = await supabase
    .from('clientes') // Changed from 'clients'
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Supabase deleteClient error:', deleteError.message || JSON.stringify(deleteError));
    return { success: false, message: 'Failed to delete client from database.' };
  }

  revalidatePath('/Clientes');
  return { success: true };
}
