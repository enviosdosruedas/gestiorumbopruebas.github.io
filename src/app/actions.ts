
'use server';

import type { Client, ClientFormData, DeliveryPerson, RepartidorFormData, DeliveryClientInfo, DeliveryClientInfoFormData, Reparto, RepartoFormData, Zona, DetalleRepartoFormData, DetalleReparto, Database, MobileDashboardTask, MobileDriverInfo, DetalleRepartoStatus, RepartoStatus } from '@/types';
import { validateAddress, type ValidateAddressOutput } from '@/ai/flows/validate-address';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { clientSchema, repartidorSchema, deliveryClientInfoSchema, repartoSchema, ALL_REPARTO_STATUSES, ALL_DETALLE_REPARTO_STATUSES } from '@/lib/schema';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';

// Client Actions
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nombre, direccion, telefono, email, created_at, updated_at')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Supabase getClients error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch clients.');
  }
  return data.map(client => ({
    ...client,
    direccion: client.direccion ?? null,
    telefono: client.telefono ?? null,
    email: client.email ?? null,
    created_at: client.created_at ?? null,
    updated_at: client.updated_at ?? null,
  })) as Client[];
}

export async function addClientAction(formData: ClientFormData): Promise<{ success: boolean; client?: Client; errors?: z.ZodIssue[]; message?: string; addressValidation?: ValidateAddressOutput }> {
  const validationResult = clientSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { nombre, direccion, telefono, email } = validationResult.data;
  
  let validatedAddressInfo: ValidateAddressOutput | undefined;
  if (direccion) { 
    try {
      validatedAddressInfo = await validateAddress({ address: direccion });
    } catch (error) {
      console.error('AI Address Validation Error:', error);
    }
  }

  const clientDataToInsert: Database['public']['Tables']['clientes']['Insert'] = {
    nombre: nombre,
    direccion: direccion || null, 
    telefono: telefono || null,
    email: email || null,
  };

  const { data: newClientRecord, error: insertError } = await supabase
    .from('clientes')
    .insert(clientDataToInsert)
    .select('id, nombre, direccion, telefono, email, created_at, updated_at')
    .single();

  if (insertError) {
    console.error('Supabase addClient error:', insertError.message || JSON.stringify(insertError));
    const specificMessage = insertError.message ? `Error de base de datos: ${insertError.message}` : 'No se pudo agregar el cliente a la base de datos.';
    return { success: false, message: specificMessage, addressValidation: validatedAddressInfo };
  }

  if (!newClientRecord) {
    console.error('Supabase addClient error: No client data returned after insert.');
    return { success: false, message: 'No se pudo obtener la información del cliente después de agregarlo.', addressValidation: validatedAddressInfo };
  }

  revalidatePath('/Clientes');
  return { 
    success: true, 
    client: {
      ...newClientRecord,
      direccion: newClientRecord.direccion ?? null,
      telefono: newClientRecord.telefono ?? null,
      email: newClientRecord.email ?? null,
      created_at: newClientRecord.created_at ?? null,
      updated_at: newClientRecord.updated_at ?? null,
    } as Client,
    addressValidation: validatedAddressInfo
  };
}

export async function updateClientAction(id: string, formData: ClientFormData): Promise<{ success: boolean; client?: Client; errors?: z.ZodIssue[]; message?: string; addressValidation?: ValidateAddressOutput }> {
  const validationResult = clientSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { nombre, direccion, telefono, email } = validationResult.data;
  
  const { data: clientToUpdate, error: findError } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !clientToUpdate) {
    console.error('Supabase find client for update error:', findError ? (findError.message || JSON.stringify(findError)) : 'Client not found');
    return { success: false, message: 'Cliente no encontrado.' };
  }
  
  let validatedAddressInfo: ValidateAddressOutput | undefined;
  if (direccion) { 
    try {
      validatedAddressInfo = await validateAddress({ address: direccion });
    } catch (error) {
      console.error('AI Address Validation Error:', error);
    }
  }
  
  const clientDataToUpdate: Database['public']['Tables']['clientes']['Update'] = {
    nombre: nombre,
    direccion: direccion || null,
    telefono: telefono || null,
    email: email || null,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedClientRecord, error: updateError } = await supabase
    .from('clientes')
    .update(clientDataToUpdate)
    .eq('id', id)
    .select('id, nombre, direccion, telefono, email, created_at, updated_at')
    .single();

  if (updateError) {
    console.error('Supabase updateClient error:', updateError.message || JSON.stringify(updateError));
    const specificMessage = updateError.message ? `Error de base de datos: ${updateError.message}` : 'No se pudo actualizar el cliente.';
    return { success: false, message: specificMessage, addressValidation: validatedAddressInfo };
  }
  
  if (!updatedClientRecord) {
    console.error('Supabase updateClient error: No client data returned after update.');
    return { success: false, message: 'No se pudo obtener la información del cliente después de actualizarlo.', addressValidation: validatedAddressInfo };
  }

  revalidatePath('/Clientes');
  return { 
    success: true, 
    client: {
      ...updatedClientRecord,
      direccion: updatedClientRecord.direccion ?? null,
      telefono: updatedClientRecord.telefono ?? null,
      email: updatedClientRecord.email ?? null,
      created_at: updatedClientRecord.created_at ?? null,
      updated_at: updatedClientRecord.updated_at ?? null,
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
    const specificMessage = deleteError.message ? `Error de base de datos: ${deleteError.message}` : 'No se pudo eliminar el cliente.';
    return { success: false, message: specificMessage };
  }

  revalidatePath('/Clientes');
  return { success: true };
}


// Delivery Person (Repartidor) Actions
export async function getRepartidores(): Promise<DeliveryPerson[]> {
  const { data, error } = await supabase
    .from('repartidores')
    .select('id, nombre, identificacion, telefono, vehiculo, created_at, updated_at')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Supabase getRepartidores error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch repartidores.');
  }
  return data.map(rp => ({
    ...rp,
    created_at: rp.created_at ?? null,
    updated_at: rp.updated_at ?? null,
  })) as DeliveryPerson[];
}

export async function addRepartidorAction(formData: RepartidorFormData): Promise<{ success: boolean; deliveryPerson?: DeliveryPerson; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = repartidorSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { nombre, identificacion, telefono, vehiculo } = validationResult.data;

  const repartidorDataToInsert: Database['public']['Tables']['repartidores']['Insert'] = {
    nombre,
    identificacion: identificacion || null,
    telefono: telefono || null,
    vehiculo: vehiculo || null,
  };

  const { data: newRecord, error: insertError } = await supabase
    .from('repartidores')
    .insert(repartidorDataToInsert)
    .select('id, nombre, identificacion, telefono, vehiculo, created_at, updated_at')
    .single();

  if (insertError) {
    console.error('Supabase addRepartidor error:', insertError.message || JSON.stringify(insertError));
    let message = 'Error al agregar repartidor a la base de datos.';
    if (insertError.code === '23505' && insertError.message.includes('repartidores_identificacion_key')) {
        message = 'Error al agregar repartidor: La identificación ya existe.';
    } else if (insertError.message) {
        message = `Error de base de datos: ${insertError.message}`;
    }
    return { success: false, message };
  }

  if (!newRecord) {
    console.error('Supabase addRepartidor error: No data returned after insert.');
    return { success: false, message: 'No se pudo obtener la información del repartidor después de agregarlo.' };
  }

  revalidatePath('/Repartidores');
  return { 
    success: true, 
    deliveryPerson: {
        ...newRecord,
        created_at: newRecord.created_at ?? null,
        updated_at: newRecord.updated_at ?? null,
    } as DeliveryPerson
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
  
  const repartidorDataToUpdate: Database['public']['Tables']['repartidores']['Update'] = {
    nombre,
    identificacion: identificacion || null,
    telefono: telefono || null,
    vehiculo: vehiculo || null,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedRecord, error: updateError } = await supabase
    .from('repartidores')
    .update(repartidorDataToUpdate)
    .eq('id', id)
    .select('id, nombre, identificacion, telefono, vehiculo, created_at, updated_at')
    .single();

  if (updateError) {
    console.error('Supabase updateRepartidor error:', updateError.message || JSON.stringify(updateError));
    let message = 'Error al actualizar repartidor en la base de datos.';
    if (updateError.code === '23505' && updateError.message.includes('repartidores_identificacion_key')) {
        message = 'Error al actualizar repartidor: La identificación ya existe para otro repartidor.';
    } else if (updateError.message) {
        message = `Error de base de datos: ${updateError.message}`;
    }
    return { success: false, message };
  }
  
  if (!updatedRecord) {
    console.error('Supabase updateRepartidor error: No data returned after update.');
    return { success: false, message: 'No se pudo obtener la información del repartidor después de actualizarlo.' };
  }
  
  revalidatePath('/Repartidores');
  return { 
    success: true, 
    deliveryPerson: {
        ...updatedRecord,
        created_at: updatedRecord.created_at ?? null,
        updated_at: updatedRecord.updated_at ?? null,
    } as DeliveryPerson
  };
}

export async function deleteRepartidorAction(id: string): Promise<{ success: boolean; message?: string }> {
  const { error: deleteError } = await supabase
    .from('repartidores')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Supabase deleteRepartidor error:', deleteError.message || JSON.stringify(deleteError));
    const specificMessage = deleteError.message ? `Error de base de datos: ${deleteError.message}` : 'Error al eliminar repartidor de la base de datos.';
    return { success: false, message: specificMessage };
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
    created_at: item.created_at ?? null,
    updated_at: item.updated_at ?? null,
  })) as DeliveryClientInfo[];
}

export async function getDeliveryClientInfosByClientId(clienteId: string): Promise<DeliveryClientInfo[]> {
  if (!clienteId) return [];
  const { data, error } = await supabase
    .from('clientes_reparto')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('nombre_reparto', { ascending: true });

  if (error) {
    console.error('Supabase getDeliveryClientInfosByClientId error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch delivery client infos for the client.');
  }
  return data.map(item => ({
    ...item,
    tarifa: item.tarifa === null || item.tarifa === undefined ? null : Number(item.tarifa),
    cliente_reparto_nombre: item.nombre_reparto,
    cliente_reparto_direccion: item.direccion_reparto,
    cliente_reparto_horario_preferido: item.rango_horario,
    cliente_reparto_telefono: item.telefono_reparto,
    created_at: item.created_at ?? null,
    updated_at: item.updated_at ?? null,
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
  const validationResult = deliveryClientInfoSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { cliente_id, nombre_reparto, direccion_reparto, rango_horario_desde, rango_horario_hasta, tarifa, telefono_reparto } = validationResult.data;

  const rango_horario_final = formatRangoHorario(rango_horario_desde, rango_horario_hasta);

  const dataToInsert: Database['public']['Tables']['clientes_reparto']['Insert'] = {
    cliente_id,
    nombre_reparto,
    direccion_reparto: direccion_reparto || null,
    rango_horario: rango_horario_final,
    tarifa: tarifa === undefined || tarifa === null ? null : tarifa,
    telefono_reparto: telefono_reparto || null,
  };

  const { data: newRecord, error: insertError } = await supabase
    .from('clientes_reparto')
    .insert(dataToInsert)
    .select('id, cliente_id, nombre_reparto, direccion_reparto, rango_horario, tarifa, telefono_reparto, created_at, updated_at')
    .single();

  if (insertError) {
    console.error('Supabase addDeliveryClientInfo error:', insertError.message || JSON.stringify(insertError));
    const specificMessage = insertError.message ? `Error de base de datos: ${insertError.message}` : 'Error al agregar información de cliente de reparto.';
    return { success: false, message: specificMessage };
  }

  if (!newRecord) {
    console.error('Supabase addDeliveryClientInfo error: No data returned after insert.');
    return { success: false, message: 'No se pudo obtener la información del cliente de reparto después de agregarla.' };
  }
  
  revalidatePath('/ClientesReparto');
  return { 
    success: true, 
    deliveryClientInfo: {
        ...newRecord,
        tarifa: newRecord.tarifa === null || newRecord.tarifa === undefined ? null : Number(newRecord.tarifa),
        created_at: newRecord.created_at ?? null,
        updated_at: newRecord.updated_at ?? null,
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

  const dataToUpdate: Database['public']['Tables']['clientes_reparto']['Update'] = {
    cliente_id,
    nombre_reparto,
    direccion_reparto: direccion_reparto || null,
    rango_horario: rango_horario_final,
    tarifa: tarifa === undefined || tarifa === null ? null : tarifa,
    telefono_reparto: telefono_reparto || null,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedRecord, error: updateError } = await supabase
    .from('clientes_reparto')
    .update(dataToUpdate)
    .eq('id', id)
    .select('id, cliente_id, nombre_reparto, direccion_reparto, rango_horario, tarifa, telefono_reparto, created_at, updated_at')
    .single();

  if (updateError) {
    console.error('Supabase updateDeliveryClientInfo error:', updateError.message || JSON.stringify(updateError));
    const specificMessage = updateError.message ? `Error de base de datos: ${updateError.message}` : 'Error al actualizar información de cliente de reparto.';
    return { success: false, message: specificMessage };
  }

  if (!updatedRecord) {
    console.error('Supabase updateDeliveryClientInfo error: No data returned after update.');
    return { success: false, message: 'No se pudo obtener la información del cliente de reparto después de actualizarla.' };
  }
  
  revalidatePath('/ClientesReparto');
  return { 
    success: true, 
    deliveryClientInfo: {
        ...updatedRecord,
        tarifa: updatedRecord.tarifa === null || updatedRecord.tarifa === undefined ? null : Number(updatedRecord.tarifa),
        created_at: updatedRecord.created_at ?? null,
        updated_at: updatedRecord.updated_at ?? null,
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
    const specificMessage = deleteError.message ? `Error de base de datos: ${deleteError.message}` : 'Error al eliminar información de cliente de reparto.';
    return { success: false, message: specificMessage };
  }

  revalidatePath('/ClientesReparto');
  return { success: true };
}

// Zona Actions
export async function getZonas(): Promise<Zona[]> {
  const { data, error } = await supabase
    .from('zonas')
    .select('id, nombre, created_at, updated_at')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Supabase getZonas error:', error.message || JSON.stringify(error));
    return []; 
  }
  return data.map(z => ({
    ...z,
    created_at: z.created_at ?? null,
    updated_at: z.updated_at ?? null,
  })) as Zona[];
}


// Reparto Actions
export async function getRepartos(): Promise<Reparto[]> {
  const { data, error } = await supabase
    .from('repartos')
    .select(`
      id,
      fecha_reparto,
      repartidor_id,
      repartidores ( nombre ),
      cliente_id,
      clientes ( nombre ),
      zona_id,
      zonas ( nombre ),
      tanda,
      observaciones,
      estado,
      created_at,
      updated_at,
      detalles_reparto ( count )
    `)
    .order('fecha_reparto', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getRepartos error:', error.message || JSON.stringify(error));
    throw new Error('Failed to fetch repartos.');
  }
  
  return data.map(reparto => {
    const itemCount = (reparto.detalles_reparto as any)?.[0]?.count || 0;
    return {
      id: reparto.id,
      fecha_reparto: reparto.fecha_reparto,
      repartidor_id: reparto.repartidor_id,
      repartidor_nombre: (reparto.repartidores as any)?.nombre || 'N/A',
      cliente_id: reparto.cliente_id,
      cliente_principal_nombre: (reparto.clientes as any)?.nombre || null,
      zona_id: reparto.zona_id,
      zona_nombre: (reparto.zonas as any)?.nombre || 'N/A',
      tanda: reparto.tanda,
      observaciones: reparto.observaciones,
      estado: reparto.estado as RepartoStatus,
      created_at: reparto.created_at ?? null,
      updated_at: reparto.updated_at ?? null,
      item_count: itemCount,
    }
  }) as Reparto[];
}

export async function addRepartoAction(formData: RepartoFormData): Promise<{ success: boolean; reparto?: Reparto; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = repartoSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { fecha_reparto, repartidor_id, cliente_id, zona_id, tanda, estado, detalles_reparto, observaciones } = validationResult.data;

  const finalClienteId = cliente_id === "___NO_CLIENTE_PRINCIPAL___" ? null : cliente_id;
  
  const { data: newReparto, error: insertRepartoError } = await supabase
    .from('repartos')
    .insert({
      fecha_reparto,
      repartidor_id,
      cliente_id: finalClienteId,
      zona_id: parseInt(zona_id, 10), 
      tanda,
      estado,
      observaciones: observaciones || null,
    })
    .select('id, cliente_id, clientes (nombre), created_at, updated_at') 
    .single();

  if (insertRepartoError || !newReparto) {
    console.error('Supabase addReparto error:', insertRepartoError?.message || 'Failed to get new reparto ID');
    const specificMessage = insertRepartoError?.message ? `Error de base de datos: ${insertRepartoError.message}` : 'Error al crear el reparto.';
    return { success: false, message: specificMessage };
  }

  const repartoId = newReparto.id;

  if (detalles_reparto && detalles_reparto.length > 0) {
    const detallesToInsert = detalles_reparto.map((detalle, index) => ({
      reparto_id: repartoId,
      cliente_reparto_id: parseInt(detalle.cliente_reparto_id, 10),
      valor_entrega: detalle.valor_entrega,
      detalle_entrega: detalle.detalle_entrega,
      orden_visita: index,
      estado_entrega: detalle.estado_entrega || 'pendiente', 
    }));

    const { error: insertDetallesError } = await supabase
      .from('detalles_reparto')
      .insert(detallesToInsert);

    if (insertDetallesError) {
      console.error('Supabase addDetallesReparto error:', insertDetallesError.message);
      await supabase.from('repartos').delete().eq('id', repartoId); // Rollback
      const specificMessage = insertDetallesError.message ? `Error de base de datos: ${insertDetallesError.message}` : 'Error al asociar ítems de entrega. Se revirtió la creación del reparto.';
      return { success: false, message: specificMessage };
    }
  }

  revalidatePath('/Repartos');
  const clienteNombreParaToast = (newReparto.clientes as any)?.nombre || (finalClienteId ? 'Cliente Existente' : 'Reparto General');
  return { 
    success: true, 
    reparto: { 
      ...newReparto, 
      cliente_principal_nombre: clienteNombreParaToast,
      created_at: newReparto.created_at ?? null,
      updated_at: newReparto.updated_at ?? null,
    } as Reparto 
  };
}

export async function updateRepartoAction(repartoId: number, formData: RepartoFormData): Promise<{ success: boolean; reparto?: Reparto; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = repartoSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }
  const { fecha_reparto, repartidor_id, cliente_id, zona_id, tanda, estado, detalles_reparto, observaciones } = validationResult.data;
  const finalClienteId = cliente_id === "___NO_CLIENTE_PRINCIPAL___" ? null : cliente_id;

  const { data: updatedRepartoDataFromDB, error: updateRepartoError } = await supabase
    .from('repartos')
    .update({
      fecha_reparto,
      repartidor_id,
      cliente_id: finalClienteId,
      zona_id: parseInt(zona_id, 10),
      tanda,
      estado,
      observaciones: observaciones || null,
      updated_at: new Date().toISOString(), 
    })
    .eq('id', repartoId)
    .select('id, cliente_id, clientes (nombre), created_at, updated_at') 
    .single();

  if (updateRepartoError) {
    console.error('Supabase updateReparto error:', updateRepartoError.message);
    const specificMessage = updateRepartoError.message ? `Error de base de datos: ${updateRepartoError.message}` : 'Error al actualizar el reparto.';
    return { success: false, message: specificMessage };
  }

  const { error: deleteDetallesError } = await supabase
    .from('detalles_reparto')
    .delete()
    .eq('reparto_id', repartoId);

  if (deleteDetallesError) {
    console.error('Supabase delete old detalles_reparto error:', deleteDetallesError.message);
    const specificMessage = deleteDetallesError.message ? `Error de base de datos: ${deleteDetallesError.message}` : 'Error al actualizar ítems de entrega (eliminación).';
    return { success: false, message: specificMessage };
  }

  if (detalles_reparto && detalles_reparto.length > 0) {
    const detallesToInsert = detalles_reparto.map((detalle, index) => ({
      reparto_id: repartoId,
      cliente_reparto_id: parseInt(detalle.cliente_reparto_id, 10),
      valor_entrega: detalle.valor_entrega,
      detalle_entrega: detalle.detalle_entrega,
      orden_visita: index,
      estado_entrega: detalle.estado_entrega || 'pendiente',
    }));

    const { error: insertDetallesError } = await supabase
      .from('detalles_reparto')
      .insert(detallesToInsert);

    if (insertDetallesError) {
      console.error('Supabase addDetallesReparto (update) error:', insertDetallesError.message);
      const specificMessage = insertDetallesError.message ? `Error de base de datos: ${insertDetallesError.message}` : 'Error al actualizar ítems de entrega (inserción).';
      return { success: false, message: specificMessage };
    }
  }
  
  revalidatePath('/Repartos');
  revalidatePath(`/Repartos/${repartoId}/report`); 
  
  const clienteNombreParaToast = (updatedRepartoDataFromDB as any)?.clientes?.nombre || (finalClienteId ? 'Cliente Existente' : 'Reparto General');

  return { 
    success: true, 
    reparto: { 
      id: repartoId, 
      cliente_principal_nombre: clienteNombreParaToast,
      created_at: updatedRepartoDataFromDB?.created_at ?? null,
      updated_at: updatedRepartoDataFromDB?.updated_at ?? null,
    } as Reparto 
  };
}

export async function deleteRepartoAction(repartoId: number): Promise<{ success: boolean; message?: string }> {
  const { error } = await supabase
    .from('repartos')
    .delete()
    .eq('id', repartoId);

  if (error) {
    console.error('Supabase deleteReparto error:', error.message);
    const specificMessage = error.message ? `Error de base de datos: ${error.message}` : 'Error al eliminar el reparto.';
    return { success: false, message: specificMessage };
  }

  revalidatePath('/Repartos');
  return { success: true };
}

export async function getRepartoByIdForReport(repartoId: number): Promise<{ reparto: Reparto | null; error?: string }> {
  const { data: repartoData, error: repartoError } = await supabase
    .from('repartos')
    .select(`
      id,
      fecha_reparto,
      observaciones,
      estado,
      tanda,
      repartidor_id,
      repartidores ( nombre ),
      cliente_id,
      clientes ( nombre ),
      zona_id,
      zonas ( nombre ),
      created_at, 
      updated_at,
      detalles_reparto (
        id,
        orden_visita,
        valor_entrega,
        detalle_entrega,
        estado_entrega,
        cliente_reparto_id,
        created_at,
        updated_at,
        clientes_reparto (
          nombre_reparto,
          direccion_reparto,
          rango_horario, 
          telefono_reparto 
        )
      )
    `)
    .eq('id', repartoId)
    .order('orden_visita', { referencedTable: 'detalles_reparto', ascending: true })
    .single();

  if (repartoError) {
    console.error('Error fetching reparto for report:', repartoError.message);
    return { reparto: null, error: 'Error al obtener los datos del reparto.' };
  }

  if (!repartoData) {
    return { reparto: null, error: 'Reparto no encontrado.' };
  }

  const reparto: Reparto = {
    id: repartoData.id,
    fecha_reparto: repartoData.fecha_reparto,
    repartidor_id: repartoData.repartidor_id,
    repartidor_nombre: (repartoData.repartidores as any)?.nombre,
    cliente_id: repartoData.cliente_id,
    cliente_principal_nombre: (repartoData.clientes as any)?.nombre,
    zona_id: repartoData.zona_id,
    zona_nombre: (repartoData.zonas as any)?.nombre,
    tanda: repartoData.tanda,
    observaciones: repartoData.observaciones,
    estado: repartoData.estado as RepartoStatus,
    created_at: repartoData.created_at ?? null, 
    updated_at: repartoData.updated_at ?? null, 
    detalles_reparto: (repartoData.detalles_reparto as any[])?.map(dr => ({
      id: dr.id,
      reparto_id: repartoData.id,
      cliente_reparto_id: dr.cliente_reparto_id,
      valor_entrega: dr.valor_entrega,
      detalle_entrega: dr.detalle_entrega,
      orden_visita: dr.orden_visita,
      estado_entrega: dr.estado_entrega as DetalleRepartoStatus,
      cliente_reparto_nombre: (dr.clientes_reparto as any)?.nombre_reparto,
      cliente_reparto_direccion: (dr.clientes_reparto as any)?.direccion_reparto,
      cliente_reparto_horario_preferido: (dr.clientes_reparto as any)?.rango_horario, 
      cliente_reparto_telefono: (dr.clientes_reparto as any)?.telefono_reparto,
      created_at: dr.created_at ?? null,
      updated_at: dr.updated_at ?? null,
    })),
  };

  return { reparto };
}

// Mobile Dashboard Actions
export async function getDriverInfo(driverId: string): Promise<MobileDriverInfo | null> {
  const { data, error } = await supabase
    .from('repartidores')
    .select('id, nombre')
    .eq('id', driverId)
    .single();

  if (error || !data) {
    console.error('Error fetching driver info for dashboard:', error?.message);
    return null; 
  }
  return data;
}

export async function getDriverDashboardTasks(driverId: string): Promise<{
  inProgress: MobileDashboardTask[];
  assigned: MobileDashboardTask[];
  completed: MobileDashboardTask[];
}> {
  const today = new Date();

  const { data: repartosHoy, error: repartosError } = await supabase
    .from('repartos')
    .select(`
      id, 
      fecha_reparto, 
      observaciones,
      detalles_reparto (
        *,
        clientes_reparto (
          nombre_reparto,
          direccion_reparto,
          rango_horario,
          telefono_reparto
        )
      )
    `)
    .eq('repartidor_id', driverId)
    .gte('fecha_reparto', format(startOfDay(today), 'yyyy-MM-dd'))
    .lte('fecha_reparto', format(endOfDay(today), 'yyyy-MM-dd'));


  if (repartosError) {
    console.error("Error fetching repartos for driver's dashboard:", repartosError.message);
    return { inProgress: [], assigned: [], completed: [] };
  }

  const allTasks: MobileDashboardTask[] = [];
  repartosHoy.forEach(reparto => {
    (reparto.detalles_reparto as any[])?.forEach(detalle => {
      allTasks.push({
        ...detalle, 
        reparto_fecha: reparto.fecha_reparto, 
        reparto_observaciones: reparto.observaciones,
        cliente_reparto_nombre: (detalle.clientes_reparto as any)?.nombre_reparto,
        cliente_reparto_direccion: (detalle.clientes_reparto as any)?.direccion_reparto,
        cliente_reparto_horario_preferido: (detalle.clientes_reparto as any)?.rango_horario,
        cliente_reparto_telefono: (detalle.clientes_reparto as any)?.telefono_reparto,
        created_at: detalle.created_at ?? null,
        updated_at: detalle.updated_at ?? null,
      });
    });
  });
  
  return {
    inProgress: allTasks.filter(task => task.estado_entrega === 'en_camino'),
    assigned: allTasks.filter(task => task.estado_entrega === 'pendiente'),
    completed: allTasks.filter(task => task.estado_entrega === 'entregado'),
  };
}

export async function updateDetalleRepartoStatusAction(detalleRepartoId: number, nuevoEstado: DetalleRepartoStatus): Promise<{ success: boolean; updatedTask?: MobileDashboardTask; message?: string }> {
  const { data, error } = await supabase
    .from('detalles_reparto')
    .update({ estado_entrega: nuevoEstado, updated_at: new Date().toISOString() })
    .eq('id', detalleRepartoId)
    .select(`
      *, 
      clientes_reparto(
        nombre_reparto, 
        direccion_reparto, 
        rango_horario, 
        telefono_reparto
      ),
      repartos(fecha_reparto, observaciones)
    `) 
    .single();

  if (error || !data) {
    console.error('Error updating detalle_reparto status:', error?.message);
    const specificMessage = error?.message ? `Error de base de datos: ${error.message}` : 'Error al actualizar estado de la entrega.';
    return { success: false, message: specificMessage };
  }
  
  const enrichedTask: MobileDashboardTask = {
    ...data,
    cliente_reparto_nombre: (data.clientes_reparto as any)?.nombre_reparto,
    cliente_reparto_direccion: (data.clientes_reparto as any)?.direccion_reparto,
    cliente_reparto_horario_preferido: (data.clientes_reparto as any)?.rango_horario,
    cliente_reparto_telefono: (data.clientes_reparto as any)?.telefono_reparto,
    reparto_fecha: (data.repartos as any)?.fecha_reparto,
    reparto_observaciones: (data.repartos as any)?.observaciones,
    created_at: data.created_at ?? null,
    updated_at: data.updated_at ?? null,
  };

  revalidatePath('/mobile-dashboard'); 
  revalidatePath('/Repartos'); // Also revalidate main repartos list
  revalidatePath(`/Repartos/${data.reparto_id}/report`); // And the report for this specific reparto
  return { success: true, updatedTask: enrichedTask };
}

export async function logoutDriverAction(): Promise<{ success: boolean }> {
  console.log("Driver logout action called");
  revalidatePath('/mobile-dashboard'); 
  return { success: true };
}
    

