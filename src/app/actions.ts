
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
    direccion: client.direccion ?? null // Ensure direccion is null if undefined from DB
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
    direccion: direccion || null, // Ensure null if empty string or undefined
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
    return { success: false, message: 'Failed to add client to database.', addressValidation: validatedAddressInfo };
  }

  revalidatePath('/Clientes');
  return { 
    success: true, 
    client: newClientRecord as Client,
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
    return { success: false, message: 'Client not found.' };
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
    return { success: false, message: 'Failed to update client in database.', addressValidation: validatedAddressInfo };
  }
  
  revalidatePath('/Clientes');
  return { 
    success: true, 
    client: updatedClientRecord as Client,
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
    .select('id, nombre, identificacion, telefono, vehiculo, created_at, updated_at')
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
    // Include other fields needed by MobileDashboardTask if they exist on clientes_reparto
    cliente_reparto_nombre: item.nombre_reparto,
    cliente_reparto_direccion: item.direccion_reparto,
    cliente_reparto_horario_preferido: item.rango_horario,
    cliente_reparto_telefono: item.telefono_reparto,
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

  const dataToUpdate: Database['public']['Tables']['clientes_reparto']['Update'] = {
    cliente_id,
    nombre_reparto,
    direccion_reparto: direccion_reparto || null,
    rango_horario: rango_horario_final,
    tarifa: tarifa === undefined ? null : tarifa,
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

// Zona Actions
export async function getZonas(): Promise<Zona[]> {
  const { data, error } = await supabase
    .from('zonas')
    .select('id, nombre')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Supabase getZonas error:', error.message || JSON.stringify(error));
    return []; 
  }
  return data as Zona[];
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
      created_at: reparto.created_at,
      updated_at: reparto.updated_at,
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

  const finalClienteId = cliente_id === "___NO_CLIENT_PRINCIPAL___" ? null : cliente_id;
  
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
    .select('id, cliente_id, clientes (nombre)') 
    .single();

  if (insertRepartoError || !newReparto) {
    console.error('Supabase addReparto error:', insertRepartoError?.message || 'Failed to get new reparto ID');
    return { success: false, message: 'Error al crear el reparto.' };
  }

  const repartoId = newReparto.id;

  if (detalles_reparto && detalles_reparto.length > 0) {
    const detallesToInsert = detalles_reparto.map((detalle, index) => ({
      reparto_id: repartoId,
      cliente_reparto_id: parseInt(detalle.cliente_reparto_id, 10),
      valor_entrega: detalle.valor_entrega,
      detalle_entrega: detalle.detalle_entrega,
      orden_visita: index,
      estado_entrega: detalle.estado_entrega || 'pendiente', // Default if not provided
    }));

    const { error: insertDetallesError } = await supabase
      .from('detalles_reparto')
      .insert(detallesToInsert);

    if (insertDetallesError) {
      console.error('Supabase addDetallesReparto error:', insertDetallesError.message);
      await supabase.from('repartos').delete().eq('id', repartoId);
      return { success: false, message: 'Error al asociar ítems de entrega al reparto. Se revirtió la creación del reparto.' };
    }
  }

  revalidatePath('/Repartos');
  const clienteNombreParaToast = (newReparto.clientes as any)?.nombre || (finalClienteId ? 'Cliente Existente' : 'Reparto General');
  return { success: true, reparto: { ...newReparto, cliente_principal_nombre: clienteNombreParaToast } as Reparto };
}

export async function updateRepartoAction(repartoId: number, formData: RepartoFormData): Promise<{ success: boolean; reparto?: Reparto; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = repartoSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }
  const { fecha_reparto, repartidor_id, cliente_id, zona_id, tanda, estado, detalles_reparto, observaciones } = validationResult.data;
  const finalClienteId = cliente_id === "___NO_CLIENT_PRINCIPAL___" ? null : cliente_id;

  const { error: updateRepartoError } = await supabase
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
    .select('id, cliente_id, clientes (nombre)') 
    .single();

  if (updateRepartoError) {
    console.error('Supabase updateReparto error:', updateRepartoError.message);
    return { success: false, message: 'Error al actualizar el reparto.' };
  }

  const { error: deleteDetallesError } = await supabase
    .from('detalles_reparto')
    .delete()
    .eq('reparto_id', repartoId);

  if (deleteDetallesError) {
    console.error('Supabase delete old detalles_reparto error:', deleteDetallesError.message);
    return { success: false, message: 'Error al actualizar ítems de entrega (eliminación).' };
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
      return { success: false, message: 'Error al actualizar ítems de entrega (inserción).' };
    }
  }
  
  revalidatePath('/Repartos');
  revalidatePath(`/Repartos/${repartoId}/report`); 

  const { data: updatedRepartoData } = await supabase
    .from('repartos')
    .select('id, cliente_id, clientes (nombre)')
    .eq('id', repartoId)
    .single();
  
  const clienteNombreParaToast = (updatedRepartoData as any)?.clientes?.nombre || (finalClienteId ? 'Cliente Existente' : 'Reparto General');

  return { success: true, reparto: { id: repartoId, cliente_principal_nombre: clienteNombreParaToast } as Reparto };
}

export async function deleteRepartoAction(repartoId: number): Promise<{ success: boolean; message?: string }> {
  const { error } = await supabase
    .from('repartos')
    .delete()
    .eq('id', repartoId);

  if (error) {
    console.error('Supabase deleteReparto error:', error.message);
    return { success: false, message: 'Error al eliminar el reparto.' };
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
      detalles_reparto (
        id,
        orden_visita,
        valor_entrega,
        detalle_entrega,
        estado_entrega,
        cliente_reparto_id,
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
    })),
    created_at: null, 
    updated_at: null, 
  };

  return { reparto };
}

// Mobile Dashboard Actions
export async function getDriverInfo(driverId: string): Promise<MobileDriverInfo | null> {
  // In a real app, fetch from your 'usuarios' or 'repartidores' table
  // For now, returning mock data or fetching from repartidores
  const { data, error } = await supabase
    .from('repartidores')
    .select('id, nombre')
    .eq('id', driverId)
    .single();

  if (error || !data) {
    console.error('Error fetching driver info for dashboard:', error?.message);
    return null; // Or a default driver
  }
  return data;
}

export async function getDriverDashboardTasks(driverId: string): Promise<{
  inProgress: MobileDashboardTask[];
  assigned: MobileDashboardTask[];
  completed: MobileDashboardTask[];
}> {
  const today = new Date();
  const startDate = format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  const endDate = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

  const { data: repartosHoy, error: repartosError } = await supabase
    .from('repartos')
    .select('id, fecha_reparto, observaciones, detalles_reparto(*, clientes_reparto(*))')
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
        // Enrich with clientes_reparto data
        cliente_reparto_nombre: (detalle.clientes_reparto as any)?.nombre_reparto,
        cliente_reparto_direccion: (detalle.clientes_reparto as any)?.direccion_reparto,
        cliente_reparto_horario_preferido: (detalle.clientes_reparto as any)?.rango_horario,
        cliente_reparto_telefono: (detalle.clientes_reparto as any)?.telefono_reparto,
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
    .select('*, clientes_reparto(*)') // Fetch enriched data
    .single();

  if (error || !data) {
    console.error('Error updating detalle_reparto status:', error?.message);
    return { success: false, message: 'Error al actualizar estado de la entrega.' };
  }
  
  // Enrich the returned task
  const enrichedTask: MobileDashboardTask = {
    ...data,
    cliente_reparto_nombre: (data.clientes_reparto as any)?.nombre_reparto,
    cliente_reparto_direccion: (data.clientes_reparto as any)?.direccion_reparto,
    cliente_reparto_horario_preferido: (data.clientes_reparto as any)?.rango_horario,
    cliente_reparto_telefono: (data.clientes_reparto as any)?.telefono_reparto,
  };


  revalidatePath('/mobile-dashboard'); 
  return { success: true, updatedTask: enrichedTask };
}

export async function logoutDriverAction(): Promise<{ success: boolean }> {
  // Placeholder for actual logout logic (e.g., clearing session, redirecting)
  console.log("Driver logout action called");
  // In a real app, you would:
  // - Call Supabase auth.signOut() if using Supabase Auth for drivers
  // - Clear any session cookies or tokens
  // - Potentially redirect the user
  revalidatePath('/mobile-dashboard'); // May not be necessary if redirecting
  return { success: true };
}
    
