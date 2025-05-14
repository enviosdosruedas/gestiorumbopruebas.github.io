
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
    console.error('Supabase getClients error:', error);
    throw new Error('Failed to fetch clients.');
  }
  // Ensure createdAt and updatedAt are strings if they exist
  return data.map(client => ({
    ...client,
    createdAt: client.createdAt ? new Date(client.createdAt).toISOString() : undefined,
    updatedAt: client.updatedAt ? new Date(client.updatedAt).toISOString() : undefined,
  })) as Client[];
}

export async function addClientAction(formData: ClientFormData): Promise<{ success: boolean; client?: Client; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = clientSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { clientCode, name, address } = validationResult.data;

  // Check for duplicate client code
  const { data: existingClient, error: fetchError } = await supabase
    .from('clients')
    .select('id')
    .eq('clientCode', clientCode) // Assuming your column name is clientCode
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: Row not found, which is fine here
    console.error('Supabase check duplicate clientCode error:', fetchError);
    return { success: false, message: 'Error checking client code. Please try again.' };
  }
  if (existingClient) {
    return { success: false, message: 'Client code already exists.' };
  }
  
  let validatedAddressInfo: ValidateAddressOutput;
  try {
    validatedAddressInfo = await validateAddress({ address });
  } catch (error) {
    console.error('AI Address Validation Error:', error);
    return { success: false, message: 'Error validating address with AI. Please try again.' };
  }

  const clientDataToInsert = {
    clientCode,
    name,
    address,
    validatedAddress: validatedAddressInfo.isValid ? validatedAddressInfo.validatedAddress : null,
    isAddressValid: validatedAddressInfo.isValid,
    // Supabase will handle createdAt and updatedAt if table is configured with defaults
  };

  const { data: newClientRecord, error: insertError } = await supabase
    .from('clients')
    .insert(clientDataToInsert)
    .select()
    .single();

  if (insertError) {
    console.error('Supabase addClient error:', insertError);
    return { success: false, message: 'Failed to add client to database.' };
  }

  revalidatePath('/Clientes');
  return { 
    success: true, 
    client: {
      ...newClientRecord,
      createdAt: newClientRecord.createdAt ? new Date(newClientRecord.createdAt).toISOString() : undefined,
      updatedAt: newClientRecord.updatedAt ? new Date(newClientRecord.updatedAt).toISOString() : undefined,
    } as Client
  };
}

export async function updateClientAction(id: string, formData: ClientFormData): Promise<{ success: boolean; client?: Client; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = clientSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { clientCode, name, address } = validationResult.data;
  
  // Check if client exists
  const { data: clientToUpdate, error: findError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !clientToUpdate) {
    console.error('Supabase find client for update error:', findError);
    return { success: false, message: 'Client not found.' };
  }

  // Check for duplicate client code (excluding the current client being updated)
  const { data: duplicateClient, error: duplicateCheckError } = await supabase
    .from('clients')
    .select('id')
    .eq('clientCode', clientCode)
    .neq('id', id)
    .single();

  if (duplicateCheckError && duplicateCheckError.code !== 'PGRST116') {
    console.error('Supabase check duplicate clientCode on update error:', duplicateCheckError);
    return { success: false, message: 'Error checking client code. Please try again.' };
  }
  if (duplicateClient) {
    return { success: false, message: 'Client code already exists for another client.' };
  }

  let validatedAddressInfo: ValidateAddressOutput;
  try {
    validatedAddressInfo = await validateAddress({ address });
  } catch (error) {
    console.error('AI Address Validation Error:', error);
    return { success: false, message: 'Error validating address with AI. Please try again.' };
  }
  
  const clientDataToUpdate = {
    clientCode,
    name,
    address,
    validatedAddress: validatedAddressInfo.isValid ? validatedAddressInfo.validatedAddress : null,
    isAddressValid: validatedAddressInfo.isValid,
    updatedAt: new Date().toISOString(), // Explicitly set updatedAt
  };

  const { data: updatedClientRecord, error: updateError } = await supabase
    .from('clients')
    .update(clientDataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Supabase updateClient error:', updateError);
    return { success: false, message: 'Failed to update client in database.' };
  }
  
  revalidatePath('/Clientes');
  return { 
    success: true, 
    client: {
      ...updatedClientRecord,
      createdAt: updatedClientRecord.createdAt ? new Date(updatedClientRecord.createdAt).toISOString() : undefined,
      updatedAt: updatedClientRecord.updatedAt ? new Date(updatedClientRecord.updatedAt).toISOString() : undefined,
    } as Client
  };
}

export async function deleteClientAction(id: string): Promise<{ success: boolean; message?: string }> {
  const { error: deleteError } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Supabase deleteClient error:', deleteError);
    return { success: false, message: 'Failed to delete client from database.' };
  }

  revalidatePath('/Clientes');
  return { success: true };
}
