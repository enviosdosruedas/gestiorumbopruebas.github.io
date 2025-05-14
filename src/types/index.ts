
export interface Client {
  id: string; // UUID from Supabase
  nombre: string; 
  direccion: string | null; // Corresponds to 'direccion' in DB
  telefono?: string | null;
  email?: string | null;
}

export interface DeliveryPerson {
  id: string; // UUID from Supabase
  nombre: string;
  identificacion?: string | null;
  telefono?: string | null;
  vehiculo?: string | null;
  // Consider adding: status: 'activo' | 'inactivo';
}

export interface DeliveryClientInfo {
  id: number; // serial, PK de clientes_reparto
  cliente_id: string; // UUID, FK a clientes.id (Cliente Principal)
  nombre_reparto: string;
  direccion_reparto: string | null;
  rango_horario: string | null; // Formato "HH:MM - HH:MM" o similar
  tarifa: number | null;
  telefono_reparto: string | null;
  created_at?: string | null; 
  updated_at?: string | null; 
  cliente_nombre?: string; // Nombre del cliente principal, para UI
  // Campos adicionales del prompt para la tabla de reporte de reparto
  horario_inicio?: string | null; // Si se almacenan por separado en DB
  horario_fin?: string | null; // Si se almacenan por separado en DB
  restricciones?: string | null; // Podría estar en clientes_reparto
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
  id: number; // O string/UUID si prefieres
  nombre: string;
  // Otros campos relevantes para la zona
}

export interface DetalleReparto {
  id?: number; // PK de detalles_reparto, opcional si es nuevo
  reparto_id: number;
  cliente_reparto_id: number; 
  valor_entrega?: number | null;
  detalle_entrega?: string | null;
  orden_visita: number;
  // Campos enriquecidos para el reporte
  cliente_reparto_nombre?: string;
  cliente_reparto_direccion?: string | null;
  cliente_reparto_horario_preferido?: string | null;
  cliente_reparto_restricciones?: string | null;
}

export interface DetalleRepartoFormData {
  cliente_reparto_id: string; // ID del ClienteReparto (viene como string del form select)
  valor_entrega?: number | null;
  detalle_entrega?: string | null;
  // orden_visita se determinará por el índice del array en react-hook-form
}

export const ALL_DELIVERY_STATUSES = ["pendiente", "en curso", "entregado", "cancelado", "reprogramado"] as const;
export type DeliveryStatus = typeof ALL_DELIVERY_STATUSES[number];

export interface Reparto {
  id: number; // serial, PK de repartos
  fecha_reparto: string; // date
  repartidor_id: string; // UUID, FK a repartidores.id
  cliente_id: string | null; // UUID, FK a clientes.id (Cliente Principal), puede ser null
  zona_id: number | null; // FK a zonas.id
  tanda: number | null; // Número de tanda
  observaciones: string | null;
  estado: DeliveryStatus; 
  created_at: string | null;
  updated_at: string | null;
  // Campos enriquecidos para la UI y reportes
  repartidor_nombre?: string;
  cliente_principal_nombre?: string | null;
  zona_nombre?: string | null;
  detalles_reparto?: DetalleReparto[]; 
  item_count?: number; // Para la lista principal, N° Items
}

export interface RepartoFormData {
  fecha_reparto: string; // YYYY-MM-DD
  repartidor_id: string;
  cliente_id: string | null; // ID del Cliente Principal (clientes.id) o null
  zona_id: string; // ID de Zona (zonas.id), viene como string del form
  tanda: number;
  estado: DeliveryStatus;
  detalles_reparto: DetalleRepartoFormData[];
  observaciones?: string | null;
}


export interface RepartoClienteReparto {
  reparto_id: number;
  cliente_reparto_id: number;
}

export interface AddressValidationSuggestion {
  description: string;
  place_id: string;
}

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string;
          nombre: string;
          direccion: string | null;
          telefono: string | null;
          email: string | null;
          // created_at y updated_at no están en tu script SQL para esta tabla
        };
        Insert: {
          id?: string;
          nombre: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
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
          // Podrías añadir horario_inicio TIME, horario_fin TIME, restricciones TEXT
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
          // status: string | null; // e.g., 'activo', 'inactivo'
        };
        Insert: {
          id?: string;
          nombre: string;
          identificacion?: string | null;
          telefono?: string | null;
          vehiculo?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          identificacion?: string | null;
          telefono?: string | null;
          vehiculo?: string | null;
        };
      };
      zonas: { // Nueva tabla
        Row: {
          id: number;
          nombre: string;
          // Otros campos...
        };
        Insert: {
          id?: number;
          nombre: string;
        };
        Update: {
          id?: number;
          nombre?: string;
        };
      };
      repartos: {
        Row: {
          id: number;
          fecha_reparto: string; // DATE
          repartidor_id: string; // UUID
          cliente_id: string | null; // UUID, puede ser null
          zona_id: number | null; // FK to zonas
          tanda: number | null;
          observaciones: string | null;
          created_at: string | null; // TIMESTAMPTZ
          updated_at: string | null; // TIMESTAMPTZ
          estado: string; // Usar DeliveryStatus
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
          estado: string;
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
          estado?: string;
        };
      };
      detalles_reparto: { // Nueva tabla
        Row: {
          id: number;
          reparto_id: number;
          cliente_reparto_id: number;
          valor_entrega: number | null;
          detalle_entrega: string | null;
          orden_visita: number;
        };
        Insert: {
          id?: number;
          reparto_id: number;
          cliente_reparto_id: number;
          valor_entrega?: number | null;
          detalle_entrega?: string | null;
          orden_visita: number;
        };
        Update: {
          id?: number;
          reparto_id?: number;
          cliente_reparto_id?: number;
          valor_entrega?: number | null;
          detalle_entrega?: string | null;
          orden_visita?: number;
        };
      };
      // La tabla reparto_cliente_reparto no es necesaria si usamos detalles_reparto
      // ya que detalles_reparto une reparto con cliente_reparto.
      // Si aún se usa para un propósito diferente, mantenerla.
      // Por ahora, la comentaré de aquí ya que el prompt se enfoca en detalles_reparto.
      /*
      reparto_cliente_reparto: {
        Row: {
          reparto_id: number;
          cliente_reparto_id: number;
        };
        Insert: {
          reparto_id: number;
          cliente_reparto_id: number;
        };
        Update: {
          reparto_id?: number;
          cliente_reparto_id?: number;
        };
      };
      */
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
          created_at?: string | null;
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

    