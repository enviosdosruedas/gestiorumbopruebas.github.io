
export interface Client {
  id: string; // UUID from Supabase
  name: string;
  address: string; // User input address
  telefono?: string | null;
  email?: string | null;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// Used by AI flow
export interface AddressValidationSuggestion {
  description: string;
  place_id: string;
}

// It's a good practice to generate Supabase types using the Supabase CLI
// and import them. For now, we define a placeholder.
// npx supabase gen types typescript --project-id <your-project-ref> --schema public > src/types/supabase.ts
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: { // The shape of a row from the clients table
          id: string;
          name: string;
          address: string;
          telefono: string | null;
          email: string | null;
          created_at: string | null; // Supabase uses created_at by default
          updated_at: string | null; // Supabase uses updated_at by default
        };
        Insert: { // The shape of data to insert into the clients table
          id?: string; // Optional because it's auto-generated
          name: string;
          address: string;
          telefono?: string | null;
          email?: string | null;
          created_at?: string | null; 
          updated_at?: string | null; 
        };
        Update: { // The shape of data to update in the clients table
          id?: string;
          name?: string;
          address?: string;
          telefono?: string | null;
          email?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      // ... other tables
    };
    Views: {
      // ... views
    };
    Functions: {
      // ... functions
    };
  };
}
