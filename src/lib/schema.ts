
import { z } from 'zod';
import type { RepartoStatus, DetalleRepartoStatus } from '@/types'; 
import { ALL_REPARTO_STATUSES, ALL_DETALLE_REPARTO_STATUSES } from '@/types'; 

export const clientSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "El nombre debe tener 100 caracteres o menos"),
  direccion: z.string().min(1, "La dirección es requerida").max(200, "La dirección debe tener 200 caracteres o menos"),
  telefono: z.string().max(20, "El teléfono debe tener 20 caracteres o menos").optional().nullable().or(z.literal('')),
  email: z.string().email({ message: "Email inválido" }).max(100, "El email debe tener 100 caracteres o menos").optional().nullable().or(z.literal('')),
});
export type ClientFormData = z.infer<typeof clientSchema>;


export const repartidorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "El nombre debe tener 100 caracteres o menos"),
  identificacion: z.string().max(50, "La identificación debe tener 50 caracteres o menos").optional().nullable().or(z.literal('')),
  telefono: z.string().max(20, "El teléfono debe tener 20 caracteres o menos").optional().nullable().or(z.literal('')),
  vehiculo: z.string().max(100, "El vehículo debe tener 100 caracteres o menos").optional().nullable().or(z.literal('')),
});
export type RepartidorFormData = z.infer<typeof repartidorSchema>;


const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const deliveryClientInfoSchema = z.object({
  cliente_id: z.string().uuid("Debe seleccionar un cliente válido."),
  nombre_reparto: z.string().min(1, "El nombre de reparto es requerido.").max(255),
  direccion_reparto: z.string().max(255, "La dirección de reparto debe tener 255 caracteres o menos").optional().nullable().or(z.literal('')),
  rango_horario_desde: z.string().regex(timeFormatRegex, "Formato HH:MM inválido").optional().nullable().or(z.literal('')),
  rango_horario_hasta: z.string().regex(timeFormatRegex, "Formato HH:MM inválido").optional().nullable().or(z.literal('')),
  tarifa: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : parseFloat(String(val))),
    z.number({ invalid_type_error: "La tarifa debe ser un número." }).min(0, "La tarifa no puede ser negativa.").optional().nullable()
  ),
  telefono_reparto: z.string().max(20, "El teléfono de reparto debe tener 20 caracteres o menos").optional().nullable().or(z.literal('')),
}).refine(data => {
  if (data.rango_horario_desde && data.rango_horario_hasta) {
    return data.rango_horario_desde <= data.rango_horario_hasta;
  }
  return true;
}, {
  message: "La hora 'desde' no puede ser posterior a la hora 'hasta'.",
  path: ["rango_horario_hasta"],
});
export type DeliveryClientInfoFormData = z.infer<typeof deliveryClientInfoSchema>;

export const detalleRepartoFormSchema = z.object({
  cliente_reparto_id: z.string().min(1, "Debe seleccionar un cliente de reparto."), 
  valor_entrega: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : parseFloat(String(val))),
    z.number({ invalid_type_error: "El valor debe ser un número." }).min(0, "El valor no puede ser negativo.").optional().nullable()
  ),
  detalle_entrega: z.string().max(500, "El detalle no puede exceder los 500 caracteres.").optional().nullable().or(z.literal('')),
  estado_entrega: z.enum(ALL_DETALLE_REPARTO_STATUSES).optional(), // Added for status updates
});
export type DetalleRepartoFormData = z.infer<typeof detalleRepartoFormSchema>;

export const repartoSchema = z.object({
  fecha_reparto: z.string().min(1, "La fecha de reparto es requerida."),
  repartidor_id: z.string().uuid("Debe seleccionar un repartidor válido."),
  cliente_id: z.string().uuid("Debe seleccionar un cliente principal válido.").nullable(), 
  zona_id: z.string().min(1,"Debe seleccionar una zona válida."), 
  tanda: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().min(1, "La tanda debe ser al menos 1.")
  ),
  estado: z.enum(ALL_REPARTO_STATUSES, { errorMap: () => ({ message: "Estado de reparto inválido." }) }),
  observaciones: z.string().max(500, "Las observaciones no pueden exceder los 500 caracteres.").optional().nullable().or(z.literal('')),
  detalles_reparto: z.array(detalleRepartoFormSchema).default([]),
}).refine(data => {
  if (data.cliente_id && data.detalles_reparto.length === 0) {
    return false; 
  }
  return true;
}, {
  message: "Si selecciona un Cliente Principal, debe agregar al menos un Ítem de Entrega.",
  path: ["detalles_reparto"], 
});

export type RepartoFormData = z.infer<typeof repartoSchema>;
    
