
'use server';

import type { Client, ClientFormData, DeliveryPerson, RepartidorFormData, DeliveryClientInfo, DeliveryClientInfoFormData } from '@/types';
import { validateAddress, type ValidateAddressOutput } from '@/ai/flows/validate-address';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { clientSchema, repartidorSchema, deliveryClientInfoSchema } from '@/lib/schema'; // deliveryClientInfoSchema ahora valida desde/hasta
import { supabase } from '@/lib/supabaseClient';

// Client Actions
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nombre, direccion, telefono, email') // No hay created_at ni updated_at en la tabla clientes segun DDL
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Supabase getClients error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch clients.');
  }
  // Ajustar mapeo si es necesario, pero parece coincidir bien ahora
  return data.map(client => ({
    id: client.id,
    nombre: client.nombre,
    direccion: client.direccion, // Es nullable
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
  if (address) { 
    try {
      validatedAddressInfo = await validateAddress({ address });
    } catch (error) {
      console.error('AI Address Validation Error:', error);
    }
  }

  const clientDataToInsert = {
    nombre: name, // DDL tiene 'nombre'
    direccion: address, // DDL tiene 'direccion'
    telefono: telefono || null,
    email: email || null,
  };

  const { data: newClientRecord, error: insertError } = await supabase
    .from('clientes') // Nombre correcto de la tabla
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
      nombre: newClientRecord.nombre,
      direccion: newClientRecord.direccion,
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
    .from('clientes') // Nombre correcto de la tabla
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !clientToUpdate) {
    console.error('Supabase find client for update error:', findError ? (findError.message || JSON.stringify(findError)) : 'Client not found');
    return { success: false, message: 'Client not found.' };
  }
  
  let validatedAddressInfo: ValidateAddressOutput | undefined;
  if (address) { 
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
    .from('clientes') // Nombre correcto de la tabla
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
      nombre: updatedClientRecord.nombre,
      direccion: updatedClientRecord.direccion,
      telefono: updatedClientRecord.telefono,
      email: updatedClientRecord.email,
    } as Client,
    addressValidation: validatedAddressInfo
  };
}

export async function deleteClientAction(id: string): Promise<{ success: boolean; message?: string }> {
  const { error: deleteError } = await supabase
    .from('clientes') // Nombre correcto de la tabla
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

// Delivery Client Info (Clientes_Reparto) Actions
export async function getDeliveryClientInfos(): Promise<DeliveryClientInfo[]> {
  const { data, error } = await supabase
    .from('clientes_reparto')
    .select(`
      id,
      cliente_id,
      nombre_reparto,
      direccion_reparto,
      rango_horario,
      tarifa,
      telefono_reparto,
      created_at,
      updated_at,
      clientes ( nombre ) 
    `)
    .order('nombre_reparto', { ascending: true });

  if (error) {
    console.error('Supabase getDeliveryClientInfos error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch delivery client infos.');
  }

  return data.map(item => ({
    ...item,
    // @ts-ignore Supabase types might not be perfect for nested selects initially
    cliente_nombre: item.clientes?.nombre || 'Cliente Desconocido', 
    tarifa: item.tarifa === null || item.tarifa === undefined ? null : Number(item.tarifa),
  })) as DeliveryClientInfo[];
}

function formatRangoHorario(desde?: string | null, hasta?: string | null): string | null {
  if (desde && hasta) {
    return `${desde} - ${hasta}`;
  } else if (desde) {
    return `Desde ${desde}`;
  } else if (hasta) {
    return `Hasta ${hasta}`;
  }
  return null;
}

export async function addDeliveryClientInfoAction(formData: DeliveryClientInfoFormData): Promise<{ success: boolean; deliveryClientInfo?: DeliveryClientInfo; errors?: z.ZodIssue[]; message?: string }> {
  // El schema ahora valida DeliveryClientInfoFormData que incluye _desde y _hasta
  const validationResult = deliveryClientInfoSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { cliente_id, nombre_reparto, direccion_reparto, rango_horario_desde, rango_horario_hasta, tarifa, telefono_reparto } = validationResult.data;

  const rango_horario_final = formatRangoHorario(rango_horario_desde, rango_horario_hasta);

  const dataToInsert = {
    cliente_id,
    nombre_reparto,
    direccion_reparto: direccion_reparto || null,
    rango_horario: rango_horario_final, // Usar el string combinado
    tarifa: tarifa === undefined ? null : tarifa,
    telefono_reparto: telefono_reparto || null,
  };

  const { data: newRecord, error: insertError } = await supabase
    .from('clientes_reparto')
    .insert(dataToInsert)
    .select('id, cliente_id, nombre_reparto, direccion_reparto, rango_horario, tarifa, telefono_reparto, created_at, updated_at')
    .single();

  if (insertError) {
    console.error('Supabase addDeliveryClientInfo error:', insertError.message || JSON.stringify(insertError));
    return { success: false, message: 'Error al agregar información de cliente de reparto.' };
  }
  
  revalidatePath('/ClientesReparto');
  return { 
    success: true, 
    deliveryClientInfo: {
        ...newRecord,
        tarifa: newRecord.tarifa === null || newRecord.tarifa === undefined ? null : Number(newRecord.tarifa),
    } as DeliveryClientInfo
  };
}

export async function updateDeliveryClientInfoAction(id: number, formData: DeliveryClientInfoFormData): Promise<{ success: boolean; deliveryClientInfo?: DeliveryClientInfo; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = deliveryClientInfoSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { cliente_id, nombre_reparto, direccion_reparto, rango_horario_desde, rango_horario_hasta, tarifa, telefono_reparto } = validationResult.data;

  const { data: recordToUpdate, error: findError } = await supabase
    .from('clientes_reparto')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !recordToUpdate) {
    console.error('Supabase find delivery client info for update error:', findError ? (findError.message || JSON.stringify(findError)) : 'Record not found');
    return { success: false, message: 'Registro de cliente de reparto no encontrado.' };
  }
  
  const rango_horario_final = formatRangoHorario(rango_horario_desde, rango_horario_hasta);

  const dataToUpdate = {
    cliente_id,
    nombre_reparto,
    direccion_reparto: direccion_reparto || null,
    rango_horario: rango_horario_final, // Usar el string combinado
    tarifa: tarifa === undefined ? null : tarifa,
    telefono_reparto: telefono_reparto || null,
  };

  const { data: updatedRecord, error: updateError } = await supabase
    .from('clientes_reparto')
    .update(dataToUpdate)
    .eq('id', id)
    .select('id, cliente_id, nombre_reparto, direccion_reparto, rango_horario, tarifa, telefono_reparto, created_at, updated_at')
    .single();

  if (updateError) {
    console.error('Supabase updateDeliveryClientInfo error:', updateError.message || JSON.stringify(updateError));
    return { success: false, message: 'Error al actualizar información de cliente de reparto.' };
  }
  
  revalidatePath('/ClientesReparto');
  return { 
    success: true, 
    deliveryClientInfo: {
        ...updatedRecord,
        tarifa: updatedRecord.tarifa === null || updatedRecord.tarifa === undefined ? null : Number(updatedRecord.tarifa),
    } as DeliveryClientInfo
  };
}

export async function deleteDeliveryClientInfoAction(id: number): Promise<{ success: boolean; message?: string }> {
  const { error: deleteError } = await supabase
    .from('clientes_reparto')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Supabase deleteDeliveryClientInfo error:', deleteError.message || JSON.stringify(deleteError));
    return { success: false, message: 'Error al eliminar información de cliente de reparto.' };
  }

  revalidatePath('/ClientesReparto');
  return { success: true };
}
