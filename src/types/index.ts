

export interface Client {
  id: string; 
  nombre: string; 
  direccion: string | null;
  telefono?: string | null;
  email?: string | null;
  created_at?: string | null; 
  updated_at?: string | null; 
}

export interface DeliveryPerson {
  id: string; 
  nombre: string;
  identificacion?: string | null;
  telefono?: string | null;
  vehiculo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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

export const ALL_DETALLE_REPARTO_STATUSES = ["pendiente", "en_camino", "entregado", "no_entregado", "cancelado"] as const;
export type DetalleRepartoStatus = typeof ALL_DETALLE_REPARTO_STATUSES[number];

export interface DetalleReparto {
  id: number; 
  reparto_id: number;
  cliente_reparto_id: number; 
  valor_entrega?: number | null;
  detalle_entrega?: string | null;
  orden_visita: number;
  estado_entrega: DetalleRepartoStatus; 
  created_at?: string | null;
  updated_at?: string | null;
  // Campos enriquecidos
  cliente_reparto_nombre?: string;
  cliente_reparto_direccion?: string | null;
  cliente_reparto_horario_preferido?: string | null;
  cliente_reparto_restricciones?: string | null;
  cliente_reparto_telefono?: string | null; 
}

export interface DetalleRepartoFormData {
  cliente_reparto_id: string; 
  valor_entrega?: number | null;
  detalle_entrega?: string | null;
  estado_entrega?: DetalleRepartoStatus; 
}

export const ALL_REPARTO_STATUSES = ["pendiente", "en curso", "entregado", "cancelado", "reprogramado"] as const;
export type RepartoStatus = typeof ALL_REPARTO_STATUSES[number];

export interface Reparto {
  id: number; 
  fecha_reparto: string; 
  repartidor_id: string; 
  cliente_id: string | null; 
  zona_id: number | null; 
  tanda: number | null; 
  observaciones: string | null;
  estado: RepartoStatus; 
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
  estado: RepartoStatus;
  detalles_reparto: DetalleRepartoFormData[];
  observaciones?: string | null;
}

export interface AddressValidationSuggestion {
  description: string;
  place_id: string;
}

// For Mobile Dashboard
export interface MobileDashboardTask extends DetalleReparto {
  reparto_fecha?: string;
  reparto_observaciones?: string | null;
}

export interface MobileDriverInfo {
  id: string;
  nombre: string;
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
          created_at: string | null; 
          updated_at: string | null; 
        };
        Insert: {
          id?: string; // uuid_generate_v4()
          nombre: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
          created_at?: string | null; // default now()
          updated_at?: string | null; // default now()
        };
        Update: {
          id?: string;
          nombre?: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
          updated_at?: string | null; // handled by trigger
        };
      };
      clientes_reparto: {
        Row: {
          id: number; // serial
          cliente_id: string; // uuid
          nombre_reparto: string; // character varying(255)
          direccion_reparto: string | null; // text
          rango_horario: string | null; // character varying(255)
          tarifa: number | null; // numeric(10,2)
          created_at: string | null; // timestamp with time zone
          updated_at: string | null; // timestamp with time zone
          telefono_reparto: string | null; // character varying(20)
        };
        Insert: {
          id?: number; // serial
          cliente_id: string;
          nombre_reparto: string;
          direccion_reparto?: string | null;
          rango_horario?: string | null;
          tarifa?: number | null;
          created_at?: string | null; // default CURRENT_TIMESTAMP
          updated_at?: string | null; // handled by trigger
          telefono_reparto?: string | null;
        };
        Update: {
          id?: number;
          cliente_id?: string;
          nombre_reparto?: string;
          direccion_reparto?: string | null;
          rango_horario?: string | null;
          tarifa?: number | null;
          updated_at?: string | null; // handled by trigger
          telefono_reparto?: string | null;
        };
      };
      detalles_reparto: { 
        Row: {
          id: number; // serial
          reparto_id: number; // integer
          cliente_reparto_id: number; // integer
          valor_entrega: number | null; // numeric(10,2)
          detalle_entrega: string | null; // text
          orden_visita: number; // integer
          estado_entrega: DetalleRepartoStatus; // TEXT - Add to DB schema
          created_at: string | null; // timestamp with time zone
          updated_at: string | null; // timestamp with time zone
        };
        Insert: {
          id?: number; // serial
          reparto_id: number;
          cliente_reparto_id: number;
          valor_entrega?: number | null;
          detalle_entrega?: string | null;
          orden_visita?: number; // default 0
          estado_entrega: DetalleRepartoStatus; // Add to DB schema
          created_at?: string | null; // default now()
          updated_at?: string | null; // default now()
        };
        Update: {
          id?: number;
          reparto_id?: number;
          cliente_reparto_id?: number;
          valor_entrega?: number | null;
          detalle_entrega?: string | null;
          orden_visita?: number;
          estado_entrega?: DetalleRepartoStatus; // Add to DB schema
          updated_at?: string | null; // handled by trigger
        };
      };
      repartidores: {
        Row: {
          id: string; // uuid
          nombre: string; // text
          identificacion: string | null; // text
          telefono: string | null; // text
          vehiculo: string | null; // text
          created_at: string | null; // timestamp with time zone
          updated_at: string | null; // timestamp with time zone
        };
        Insert: {
          id?: string; // uuid_generate_v4()
          nombre: string;
          identificacion?: string | null;
          telefono?: string | null;
          vehiculo?: string | null;
          created_at?: string | null; // default now()
          updated_at?: string | null; // default now()
        };
        Update: {
          id?: string;
          nombre?: string;
          identificacion?: string | null;
          telefono?: string | null;
          vehiculo?: string | null;
          updated_at?: string | null; // handled by trigger
        };
      };
      repartos: {
        Row: {
          id: number; // serial
          fecha_reparto: string; // date
          repartidor_id: string; // uuid
          cliente_id: string | null; // uuid
          observaciones: string | null; // text
          created_at: string | null; // timestamp with time zone
          updated_at: string | null; // timestamp with time zone
          estado: string | null; // character varying(20)
          zona_id: number | null; // integer
          tanda: number | null; // integer
        };
        Insert: {
          id?: number; // serial
          fecha_reparto: string;
          repartidor_id: string;
          cliente_id?: string | null;
          observaciones?: string | null;
          created_at?: string | null; // default CURRENT_TIMESTAMP
          updated_at?: string | null; // default now()
          estado?: string | null; // default 'Asignado'
          zona_id?: number | null;
          tanda?: number | null;
        };
        Update: {
          id?: number;
          fecha_reparto?: string;
          repartidor_id?: string;
          cliente_id?: string | null;
          observaciones?: string | null;
          updated_at?: string | null; // handled by trigger
          estado?: string | null;
          zona_id?: number | null;
          tanda?: number | null;
        };
      };
      usuarios: {
        Row: {
          codigo: number; // serial
          nombre: string; // character varying(255)
          pass: string; // text
          rol: string; // character varying(50)
          created_at: string | null; // timestamp with time zone
          updated_at: string | null; // timestamp with time zone
          repartidor_id: string | null; // uuid
        };
        Insert: {
          codigo?: number; // serial
          nombre: string;
          pass: string;
          rol: string;
          created_at?: string | null; // default CURRENT_TIMESTAMP
          updated_at?: string | null; // default now()
          repartidor_id?: string | null;
        };
        Update: {
          codigo?: number;
          nombre?: string;
          pass?: string;
          rol?: string;
          updated_at?: string | null; // handled by trigger
          repartidor_id?: string | null;
        };
      };
      zonas: { 
        Row: {
          id: number; // serial
          nombre: string; // text
          created_at: string | null; // timestamp with time zone
          updated_at: string | null; // timestamp with time zone
        };
        Insert: {
          id?: number; // serial
          nombre: string;
          created_at?: string | null; // default now()
          updated_at?: string | null; // default now()
        };
        Update: {
          id?: number;
          nombre?: string;
          updated_at?: string | null; // handled by trigger
        };
      };
    };
    Views: {
      // Define views here if any
    };
    Functions: {
      update_updated_at_column?: { // Based on your schema's trigger usage
        Args: {}; 
        Returns: unknown; 
      };
      // You might have other functions like uuid_generate_v4 from extensions
      // but they are not typically defined here unless directly called from client
    };
  };
}
    
