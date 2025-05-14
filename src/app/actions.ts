
'use server';

import type { Client, ClientFormData } from '@/types';
import { validateAddress, type ValidateAddressOutput } from '@/ai/flows/validate-address';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { clientSchema } from '@/lib/schema';
import { supabase } from '@/lib/supabaseClient';

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Supabase getClients error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch clients.');
  }
  // Ensure created_at and updated_at are strings if they exist and map to domain model
  return data.map(client => ({
    id: client.id,
    name: client.name,
    address: client.address,
    telefono: client.telefono,
    email: client.email,
    createdAt: client.created_at ? new Date(client.created_at).toISOString() : undefined,
    updatedAt: client.updated_at ? new Date(client.updated_at).toISOString() : undefined,
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
    // We can still validate the address for immediate UI feedback, but won't store its specific result fields
    validatedAddressInfo = await validateAddress({ address });
  } catch (error) {
    console.error('AI Address Validation Error:', error);
    // Non-fatal, proceed with client creation but inform about validation issue potentially
  }

  const clientDataToInsert = {
    name,
    address,
    telefono: telefono || null,
    email: email || null,
    // Supabase will handle created_at and updated_at if table is configured with defaults
  };

  const { data: newClientRecord, error: insertError } = await supabase
    .from('clients')
    .insert(clientDataToInsert)
    .select()
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
      name: newClientRecord.name,
      address: newClientRecord.address,
      telefono: newClientRecord.telefono,
      email: newClientRecord.email,
      createdAt: newClientRecord.created_at ? new Date(newClientRecord.created_at).toISOString() : undefined,
      updatedAt: newClientRecord.updated_at ? new Date(newClientRecord.updated_at).toISOString() : undefined,
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
    .from('clients')
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
    name,
    address,
    telefono: telefono || null,
    email: email || null,
    updated_at: new Date().toISOString(), 
  };

  const { data: updatedClientRecord, error: updateError } = await supabase
    .from('clients')
    .update(clientDataToUpdate)
    .eq('id', id)
    .select()
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
      name: updatedClientRecord.name,
      address: updatedClientRecord.address,
      telefono: updatedClientRecord.telefono,
      email: updatedClientRecord.email,
      createdAt: updatedClientRecord.created_at ? new Date(updatedClientRecord.created_at).toISOString() : undefined,
      updatedAt: updatedClientRecord.updated_at ? new Date(updatedClientRecord.updated_at).toISOString() : undefined,
    } as Client,
    addressValidation: validatedAddressInfo
  };
}

export async function deleteClientAction(id: string): Promise<{ success: boolean; message?: string }> {
  const { error: deleteError } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Supabase deleteClient error:', deleteError.message || JSON.stringify(deleteError));
    return { success: false, message: 'Failed to delete client from database.' };
  }

  revalidatePath('/Clientes');
  return { success: true };
}
