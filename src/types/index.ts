
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
  estado_entrega: DetalleRepartoStatus; // Added field for individual item status
  created_at?: string | null;
  updated_at?: string | null;
  // Campos enriquecidos
  cliente_reparto_nombre?: string;
  cliente_reparto_direccion?: string | null;
  cliente_reparto_horario_preferido?: string | null;
  cliente_reparto_restricciones?: string | null;
  cliente_reparto_telefono?: string | null; // Added for task card
}

export interface DetalleRepartoFormData {
  cliente_reparto_id: string; 
  valor_entrega?: number | null;
  detalle_entrega?: string | null;
  estado_entrega?: DetalleRepartoStatus; // Added
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
  // Potentially add more fields specific to the mobile dashboard view if needed
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
          id?: string;
          nombre: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
          created_at?: string | null; 
          updated_at?: string | null; 
        };
        Update: {
          id?: string;
          nombre?: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
          updated_at?: string | null; 
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
          created_at: string | null; 
          updated_at: string | null; 
        };
        Insert: {
          id?: string;
          nombre: string;
          identificacion?: string | null;
          telefono?: string | null;
          vehiculo?: string | null;
          created_at?: string | null; 
          updated_at?: string | null; 
        };
        Update: {
          id?: string;
          nombre?: string;
          identificacion?: string | null;
          telefono?: string | null;
          vehiculo?: string | null;
          updated_at?: string | null; 
        };
      };
      zonas: { 
        Row: {
          id: number;
          nombre: string;
          created_at: string | null; 
          updated_at: string | null; 
        };
        Insert: {
          id?: number;
          nombre: string;
          created_at?: string | null; 
          updated_at?: string | null; 
        };
        Update: {
          id?: number;
          nombre?: string;
          updated_at?: string | null; 
        };
      };
      repartos: {
        Row: {
          id: number;
          fecha_reparto: string; 
          repartidor_id: string; 
          cliente_id: string | null; 
          zona_id: number | null; 
          tanda: number | null; 
          observaciones: string | null;
          created_at: string | null; 
          updated_at: string | null; 
          estado: RepartoStatus; 
        };
        Insert: {
          id?: number;
          fecha_reparto: string;
          repartidor_id: string;
          cliente_id?: string | null; 
          zona_id?: number | null; 
          tanda?: number | null; 
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado: RepartoStatus;
        };
        Update: {
          id?: number;
          fecha_reparto?: string;
          repartidor_id?: string;
          cliente_id?: string | null; 
          zona_id?: number | null; 
          tanda?: number | null; 
          observaciones?: string | null;
          updated_at?: string | null;
          estado?: RepartoStatus;
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
          estado_entrega: DetalleRepartoStatus; // Added
          created_at: string | null; 
          updated_at: string | null; 
        };
        Insert: {
          id?: number;
          reparto_id: number;
          cliente_reparto_id: number;
          valor_entrega?: number | null;
          detalle_entrega?: string | null;
          orden_visita: number;
          estado_entrega: DetalleRepartoStatus; // Added
          created_at?: string | null; 
          updated_at?: string | null; 
        };
        Update: {
          id?: number;
          reparto_id?: number;
          cliente_reparto_id?: number;
          valor_entrega?: number | null;
          detalle_entrega?: string | null;
          orden_visita?: number;
          estado_entrega?: DetalleRepartoStatus; // Added
          updated_at?: string | null; 
        };
      };
      usuarios: {
        Row: {
          codigo: number; 
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
      update_updated_at_column?: { 
        Args: {}; 
        Returns: unknown; 
      };
    };
  };
}
    
