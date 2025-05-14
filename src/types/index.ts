
export interface Client {
  id: string; // UUID from Supabase
  nombre: string; 
  direccion: string | null;
  telefono?: string | null;
  email?: string | null;
  // created_at y updated_at no se añaden aquí porque la UI actual no los usa,
  // pero estarán en el tipo Database para la lógica de backend si es necesario.
}

export interface DeliveryPerson {
  id: string; // UUID from Supabase
  nombre: string;
  identificacion?: string | null;
  telefono?: string | null;
  vehiculo?: string | null;
  // status?: 'activo' | 'inactivo'; // Considerar para el futuro
}

export interface DeliveryClientInfo {
  id: number; 
  cliente_id: string; 
  nombre_reparto: string;
  direccion_reparto: string | null;
  rango_horario: string | null; 
  tarifa: number | null;
  telefono_reparto: string | null;
  created_at?: string | null; 
  updated_at?: string | null; 
  cliente_nombre?: string; 
  // Campos para reporte
  horario_inicio?: string | null; 
  horario_fin?: string | null; 
  restricciones?: string | null; 
}

export interface DeliveryClientInfoFormData {
  cliente_id: string;
  nombre_reparto: string;
  direccion_reparto?: string | null;
  rango_horario_desde?: string | null;
  rango_horario_hasta?: string | null;
  tarifa?: number | null;
  telefono_reparto?: string | null;
}

export interface Zona {
  id: number; 
  nombre: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DetalleReparto {
  id?: number; 
  reparto_id: number;
  cliente_reparto_id: number; 
  valor_entrega?: number | null;
  detalle_entrega?: string | null;
  orden_visita: number;
  created_at?: string | null;
  updated_at?: string | null;
  // Campos enriquecidos
  cliente_reparto_nombre?: string;
  cliente_reparto_direccion?: string | null;
  cliente_reparto_horario_preferido?: string | null;
  cliente_reparto_restricciones?: string | null;
}

export interface DetalleRepartoFormData {
  cliente_reparto_id: string; 
  valor_entrega?: number | null;
  detalle_entrega?: string | null;
}

export const ALL_DELIVERY_STATUSES = ["pendiente", "en curso", "entregado", "cancelado", "reprogramado"] as const;
export type DeliveryStatus = typeof ALL_DELIVERY_STATUSES[number];

export interface Reparto {
  id: number; 
  fecha_reparto: string; 
  repartidor_id: string; 
  cliente_id: string | null; 
  zona_id: number | null; 
  tanda: number | null; 
  observaciones: string | null;
  estado: DeliveryStatus; 
  created_at: string | null;
  updated_at: string | null;
  // Campos enriquecidos
  repartidor_nombre?: string;
  cliente_principal_nombre?: string | null;
  zona_nombre?: string | null;
  detalles_reparto?: DetalleReparto[]; 
  item_count?: number; 
}

export interface RepartoFormData {
  fecha_reparto: string; 
  repartidor_id: string;
  cliente_id: string | null; 
  zona_id: string; 
  tanda: number;
  estado: DeliveryStatus;
  detalles_reparto: DetalleRepartoFormData[];
  observaciones?: string | null;
}

// Ya no se usa esta tabla de unión, se usa detalles_reparto
// export interface RepartoClienteReparto {
//   reparto_id: number;
//   cliente_reparto_id: number;
// }

export interface AddressValidationSuggestion {
  description: string;
  place_id: string;
}

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string;
          nombre: string;
          direccion: string | null;
          telefono: string | null;
          email: string | null;
          created_at: string | null; // Añadido
          updated_at: string | null; // Añadido
        };
        Insert: {
          id?: string;
          nombre: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
          created_at?: string | null; // Añadido
          updated_at?: string | null; // Añadido
        };
        Update: {
          id?: string;
          nombre?: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
          updated_at?: string | null; // Añadido
        };
      };
      clientes_reparto: {
        Row: {
          id: number;
          cliente_id: string;
          nombre_reparto: string;
          direccion_reparto: string | null;
          rango_horario: string | null;
          tarifa: number | null;
          created_at: string | null;
          updated_at: string | null;
          telefono_reparto: string | null;
        };
        Insert: {
          id?: number; 
          cliente_id: string;
          nombre_reparto: string;
          direccion_reparto?: string | null;
          rango_horario?: string | null;
          tarifa?: number | null;
          created_at?: string | null; 
          updated_at?: string | null; 
          telefono_reparto?: string | null;
        };
        Update: {
          id?: number;
          cliente_id?: string;
          nombre_reparto?: string;
          direccion_reparto?: string | null;
          rango_horario?: string | null;
          tarifa?: number | null;
          updated_at?: string | null; 
          telefono_reparto?: string | null;
        };
      };
      repartidores: {
        Row: {
          id: string;
          nombre: string;
          identificacion: string | null;
          telefono: string | null;
          vehiculo: string | null;
          created_at: string | null; // Añadido
          updated_at: string | null; // Añadido
        };
        Insert: {
          id?: string;
          nombre: string;
          identificacion?: string | null;
          telefono?: string | null;
          vehiculo?: string | null;
          created_at?: string | null; // Añadido
          updated_at?: string | null; // Añadido
        };
        Update: {
          id?: string;
          nombre?: string;
          identificacion?: string | null;
          telefono?: string | null;
          vehiculo?: string | null;
          updated_at?: string | null; // Añadido
        };
      };
      zonas: { 
        Row: {
          id: number;
          nombre: string;
          created_at: string | null; // Añadido
          updated_at: string | null; // Añadido
        };
        Insert: {
          id?: number;
          nombre: string;
          created_at?: string | null; // Añadido
          updated_at?: string | null; // Añadido
        };
        Update: {
          id?: number;
          nombre?: string;
          updated_at?: string | null; // Añadido
        };
      };
      repartos: {
        Row: {
          id: number;
          fecha_reparto: string; 
          repartidor_id: string; 
          cliente_id: string | null; // Modificado a nullable
          zona_id: number | null; // Añadido
          tanda: number | null; // Añadido
          observaciones: string | null;
          created_at: string | null; 
          updated_at: string | null; 
          estado: string; 
        };
        Insert: {
          id?: number;
          fecha_reparto: string;
          repartidor_id: string;
          cliente_id?: string | null; // Modificado a nullable
          zona_id?: number | null; // Añadido
          tanda?: number | null; // Añadido
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado: string;
        };
        Update: {
          id?: number;
          fecha_reparto?: string;
          repartidor_id?: string;
          cliente_id?: string | null; // Modificado a nullable
          zona_id?: number | null; // Añadido
          tanda?: number | null; // Añadido
          observaciones?: string | null;
          updated_at?: string | null;
          estado?: string;
        };
      };
      detalles_reparto: { 
        Row: {
          id: number;
          reparto_id: number;
          cliente_reparto_id: number;
          valor_entrega: number | null;
          detalle_entrega: string | null;
          orden_visita: number;
          created_at: string | null; // Añadido
          updated_at: string | null; // Añadido
        };
        Insert: {
          id?: number;
          reparto_id: number;
          cliente_reparto_id: number;
          valor_entrega?: number | null;
          detalle_entrega?: string | null;
          orden_visita: number;
          created_at?: string | null; // Añadido
          updated_at?: string | null; // Añadido
        };
        Update: {
          id?: number;
          reparto_id?: number;
          cliente_reparto_id?: number;
          valor_entrega?: number | null;
          detalle_entrega?: string | null;
          orden_visita?: number;
          updated_at?: string | null; // Añadido
        };
      };
      usuarios: {
        Row: {
          codigo: number; // Cambiado de serial a number para el tipo Row
          nombre: string;
          pass: string;
          rol: string;
          created_at: string | null; 
          updated_at: string | null; 
          repartidor_id: string | null;
        };
        Insert: {
          codigo?: number;
          nombre: string;
          pass: string;
          rol: string;
          created_at?: string | null;
          updated_at?: string | null;
          repartidor_id?: string | null;
        };
        Update: {
          codigo?: number;
          nombre?: string;
          pass?: string;
          rol?: string;
          updated_at?: string | null;
          repartidor_id?: string | null;
        };
      };
    };
    Views: {
      // Define views here if any
    };
    Functions: {
      // Renombrado para consistencia con el script SQL generado
      update_updated_at_column?: { 
        Args: {}; 
        Returns: unknown; 
      };
    };
  };
}
    
    