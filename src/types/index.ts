
export interface Client {
  id: string; // UUID from Supabase
  name: string;
  address: string | null; // direccion from clientes table
  telefono?: string | null;
  email?: string | null;
  // No createdAt or updatedAt as they are not in the 'clientes' table definition
}

// Used by AI flow
export interface AddressValidationSuggestion {
  description: string;
  place_id: string;
}

export interface Database {
  public: {
    Tables: {
      clientes: { // Renamed from clients, columns updated
        Row: {
          id: string;
          nombre: string;
          direccion: string | null;
          telefono: string | null;
          email: string | null;
          // No created_at or updated_at as per provided SQL for this table
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
          id: number; // serial
          cliente_id: string; // uuid
          nombre_reparto: string; // character varying(255)
          direccion_reparto: string | null; // text
          rango_horario: string | null; // character varying(255)
          tarifa: number | null; // numeric(10, 2)
          created_at: string | null; // timestamp with time zone
          updated_at: string | null; // timestamp with time zone
          telefono_reparto: string | null; // character varying(20)
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
          created_at?: string | null;
          updated_at?: string | null;
          telefono_reparto?: string | null;
        };
      };
      repartidores: {
        Row: {
          id: string; // uuid
          nombre: string; // text
          identificacion: string | null; // text
          telefono: string | null; // text
          vehiculo: string | null; // text
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
        Update: { // PK updates are usually not done, but for completeness
          reparto_id?: number;
          cliente_reparto_id?: number;
        };
      };
      repartos: {
        Row: {
          id: number; // serial
          fecha_reparto: string; // date
          repartidor_id: string; // uuid
          cliente_id: string; // uuid
          observaciones: string | null; // text
          created_at: string | null; // timestamp without time zone
          updated_at: string | null; // timestamp without time zone
          estado: string | null; // character varying(20)
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
          codigo: number; // serial
          nombre: string; // character varying(255)
          pass: string; // text (should be hashed)
          rol: string; // character varying(50)
          created_at: string | null; // timestamp without time zone
          updated_at: string | null; // timestamp without time zone
          repartidor_id: string | null; // uuid
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
      update_updated_at_column?: { // Example, if you define this
        Args: {};
        Returns: unknown; // Adjust based on actual return
      };
      // ... other functions
    };
  };
}
