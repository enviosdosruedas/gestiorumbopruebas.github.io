
export interface Client {
  id: string; // UUID from Supabase
  nombre: string; // Mapeado desde 'nombre' en la tabla 'clientes'
  direccion: string | null;
  telefono?: string | null;
  email?: string | null;
  // created_at y updated_at no están en la tabla clientes según el último DDL
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
  created_at?: string | null; // Se maneja por DB
  updated_at?: string | null; // Se maneja por DB trigger
  // Para visualización, podríamos añadir el nombre del cliente principal
  cliente_nombre?: string;
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
          id?: number; // Opcional porque es serial
          cliente_id: string;
          nombre_reparto: string;
          direccion_reparto?: string | null;
          rango_horario?: string | null;
          tarifa?: number | null;
          created_at?: string | null; // Supabase lo maneja
          updated_at?: string | null; // Supabase lo maneja
          telefono_reparto?: string | null;
        };
        Update: {
          id?: number;
          cliente_id?: string;
          nombre_reparto?: string;
          direccion_reparto?: string | null;
          rango_horario?: string | null;
          tarifa?: number | null;
          // created_at no se actualiza
          updated_at?: string | null; // Supabase lo maneja
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
          fecha_reparto: string; // date
          repartidor_id: string;
          cliente_id: string;
          observaciones: string | null;
          created_at: string | null; // timestamp without time zone
          updated_at: string | null; // timestamp without time zone
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
          created_at?: string | null;
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
          created_at: string | null; // timestamp without time zone
          updated_at: string | null; // timestamp without time zone
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
      update_updated_at_column?: { // Asumo que esta función existe y se usa en triggers
        Args: {};
        Returns: unknown;
      };
    };
  };
}
