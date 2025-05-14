
export interface Client {
  id: string; // UUID from Supabase
  nombre: string; 
  direccion: string | null; // Ajustado para reflejar que la dirección puede ser null
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
  rango_horario: string | null; // Este se mantendrá como string en el modelo de DB por ahora
  tarifa: number | null;
  telefono_reparto: string | null;
  created_at?: string | null; 
  updated_at?: string | null; 
  cliente_nombre?: string;
}

// FormData para el formulario, ahora con campos separados para el horario
export interface DeliveryClientInfoFormData {
  cliente_id: string;
  nombre_reparto: string;
  direccion_reparto?: string | null;
  rango_horario_desde?: string | null; // Nuevo campo
  rango_horario_hasta?: string | null; // Nuevo campo
  tarifa?: number | null;
  telefono_reparto?: string | null;
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
          // created_at and updated_at are not explicitly in the DDL for clientes
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
          rango_horario: string | null; // Mantenido como string
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
          rango_horario?: string | null; // Se guardará el string combinado aquí
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
          rango_horario?: string | null; // Se guardará el string combinado aquí
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
          fecha_reparto: string; 
          repartidor_id: string;
          cliente_id: string;
          observaciones: string | null;
          created_at: string | null; 
          updated_at: string | null; 
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
