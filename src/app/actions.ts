
'use server';

import type { Client, ClientFormData, DeliveryPerson, RepartidorFormData } from '@/types';
import { validateAddress, type ValidateAddressOutput } from '@/ai/flows/validate-address';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { clientSchema, repartidorSchema } from '@/lib/schema';
import { supabase } from '@/lib/supabaseClient';

// Client Actions
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nombre, direccion, telefono, email')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Supabase getClients error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch clients.');
  }
  return data.map(client => ({
    id: client.id,
    name: client.nombre,
    address: client.direccion,
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
  if (address) { // Only validate if address is provided
    try {
      validatedAddressInfo = await validateAddress({ address });
    } catch (error) {
      console.error('AI Address Validation Error:', error);
    }
  }


  const clientDataToInsert = {
    nombre: name,
    direccion: address,
    telefono: telefono || null,
    email: email || null,
  };

  const { data: newClientRecord, error: insertError } = await supabase
    .from('clientes')
    .insert(clientDataToInsert)
    .select('id, nombre, direccion, telefono, email')
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
    .from('clientes')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !clientToUpdate) {
    console.error('Supabase find client for update error:', findError ? (findError.message || JSON.stringify(findError)) : 'Client not found');
    return { success: false, message: 'Client not found.' };
  }
  
  let validatedAddressInfo: ValidateAddressOutput | undefined;
  if (address) { // Only validate if address is provided
    try {
      validatedAddressInfo = await validateAddress({ address });
    } catch (error) {
      console.error('AI Address Validation Error:', error);
    }
  }
  
  const clientDataToUpdate = {
    nombre: name,
    direccion: address,
    telefono: telefono || null,
    email: email || null,
  };

  const { data: updatedClientRecord, error: updateError } = await supabase
    .from('clientes')
    .update(clientDataToUpdate)
    .eq('id', id)
    .select('id, nombre, direccion, telefono, email')
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
    .from('clientes')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Supabase deleteClient error:', deleteError.message || JSON.stringify(deleteError));
    return { success: false, message: 'Failed to delete client from database.' };
  }

  revalidatePath('/Clientes');
  return { success: true };
}


// Delivery Person (Repartidor) Actions
export async function getRepartidores(): Promise<DeliveryPerson[]> {
  const { data, error } = await supabase
    .from('repartidores')
    .select('id, nombre, identificacion, telefono, vehiculo')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Supabase getRepartidores error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch repartidores.');
  }
  return data as DeliveryPerson[];
}

export async function addRepartidorAction(formData: RepartidorFormData): Promise<{ success: boolean; deliveryPerson?: DeliveryPerson; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = repartidorSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { nombre, identificacion, telefono, vehiculo } = validationResult.data;

  const repartidorDataToInsert = {
    nombre,
    identificacion: identificacion || null,
    telefono: telefono || null,
    vehiculo: vehiculo || null,
  };

  const { data: newRecord, error: insertError } = await supabase
    .from('repartidores')
    .insert(repartidorDataToInsert)
    .select('id, nombre, identificacion, telefono, vehiculo')
    .single();

  if (insertError) {
    console.error('Supabase addRepartidor error:', insertError.message || JSON.stringify(insertError));
    if (insertError.code === '23505' && insertError.message.includes('repartidores_identificacion_key')) {
        return { success: false, message: 'Error al agregar repartidor: La identificación ya existe.' };
    }
    return { success: false, message: 'Error al agregar repartidor a la base de datos.' };
  }

  revalidatePath('/Repartidores');
  return { 
    success: true, 
    deliveryPerson: newRecord as DeliveryPerson
  };
}

export async function updateRepartidorAction(id: string, formData: RepartidorFormData): Promise<{ success: boolean; deliveryPerson?: DeliveryPerson; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = repartidorSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { nombre, identificacion, telefono, vehiculo } = validationResult.data;
  
  const { data: recordToUpdate, error: findError } = await supabase
    .from('repartidores')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !recordToUpdate) {
    console.error('Supabase find repartidor for update error:', findError ? (findError.message || JSON.stringify(findError)) : 'Repartidor not found');
    return { success: false, message: 'Repartidor no encontrado.' };
  }
  
  const repartidorDataToUpdate = {
    nombre,
    identificacion: identificacion || null,
    telefono: telefono || null,
    vehiculo: vehiculo || null,
  };

  const { data: updatedRecord, error: updateError } = await supabase
    .from('repartidores')
    .update(repartidorDataToUpdate)
    .eq('id', id)
    .select('id, nombre, identificacion, telefono, vehiculo')
    .single();

  if (updateError) {
    console.error('Supabase updateRepartidor error:', updateError.message || JSON.stringify(updateError));
    if (updateError.code === '23505' && updateError.message.includes('repartidores_identificacion_key')) {
        return { success: false, message: 'Error al actualizar repartidor: La identificación ya existe para otro repartidor.' };
    }
    return { success: false, message: 'Error al actualizar repartidor en la base de datos.' };
  }
  
  revalidatePath('/Repartidores');
  return { 
    success: true, 
    deliveryPerson: updatedRecord as DeliveryPerson
  };
}

export async function deleteRepartidorAction(id: string): Promise<{ success: boolean; message?: string }> {
  const { error: deleteError } = await supabase
    .from('repartidores')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Supabase deleteRepartidor error:', deleteError.message || JSON.stringify(deleteError));
    return { success: false, message: 'Error al eliminar repartidor de la base de datos.' };
  }

  revalidatePath('/Repartidores');
  return { success: true };
}
