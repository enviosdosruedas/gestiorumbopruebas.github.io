
export interface Client {
  id: string; // UUID from Supabase
  nombre: string; 
  direccion: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface DeliveryPerson {
  id: string; // UUID from Supabase
  nombre: string;
  identificacion?: string | null;
  telefono?: string | null;
  vehiculo?: string | null;
}

export interface DeliveryClientInfo {
  id: number; // serial, PK de clientes_reparto
  cliente_id: string; // UUID, FK a clientes.id
  nombre_reparto: string;
  direccion_reparto: string | null;
  rango_horario: string | null;
  tarifa: number | null;
  telefono_reparto: string | null;
  created_at?: string | null; 
  updated_at?: string | null; 
  cliente_nombre?: string; // Nombre del cliente principal, para UI
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

export interface Reparto {
  id: number; // serial, PK de repartos
  fecha_reparto: string; // date
  repartidor_id: string; // UUID, FK a repartidores.id
  cliente_id: string; // UUID, FK a clientes.id
  observaciones: string | null;
  estado: string | null; // 'Asignado', 'En Curso', 'Completado'
  created_at: string | null;
  updated_at: string | null;
  // Campos enriquecidos para la UI
  repartidor_nombre?: string;
  cliente_principal_nombre?: string;
  clientes_reparto_asignados?: DeliveryClientInfo[]; // Lista de DeliveryClientInfo asociados a este reparto
}

export interface RepartoFormData {
  fecha_reparto: string; // YYYY-MM-DD
  repartidor_id: string;
  cliente_id: string;
  selected_clientes_reparto_ids: number[]; // IDs de clientes_reparto
  observaciones?: string | null;
  estado: string;
}

export interface RepartoClienteReparto {
  reparto_id: number;
  cliente_reparto_id: number;
}


// Used by AI flow
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
      repartos: {
        Row: {
          id: number;
          fecha_reparto: string; // DATE
          repartidor_id: string; // UUID
          cliente_id: string; // UUID
          observaciones: string | null;
          created_at: string | null; // TIMESTAMPTZ
          updated_at: string | null; // TIMESTAMPTZ
          estado: string | null;
        };
        Insert: {
          id?: number;
          fecha_reparto: string;
          repartidor_id: string;
          cliente_id: string;
          observaciones?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          estado?: string | null;
        };
        Update: {
          id?: number;
          fecha_reparto?: string;
          repartidor_id?: string;
          cliente_id?: string;
          observaciones?: string | null;
          updated_at?: string | null;
          estado?: string | null;
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
        Args: {}; // Supongo que no tiene argumentos o son manejados por el trigger
        Returns: unknown; // O el tipo específico si lo conoces
      };
    };
  };
}
