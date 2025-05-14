
export interface Client {
  id: string; // UUID from Supabase
  clientCode: string;
  name: string;
  address: string; // User input address
  validatedAddress?: string | null;
  isAddressValid?: boolean | null;
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
          clientCode: string;
          name: string;
          address: string;
          validatedAddress: string | null;
          isAddressValid: boolean | null;
          createdAt: string | null;
          updatedAt: string | null;
        };
        Insert: { // The shape of data to insert into the clients table
          id?: string; // Optional because it's auto-generated
          clientCode: string;
          name: string;
          address: string;
          validatedAddress?: string | null;
          isAddressValid?: boolean | null;
          createdAt?: string | null; // Optional if DB has default
          updatedAt?: string | null; // Optional if DB has default/trigger
        };
        Update: { // The shape of data to update in the clients table
          id?: string;
          clientCode?: string;
          name?: string;
          address?: string;
          validatedAddress?: string | null;
          isAddressValid?: boolean | null;
          createdAt?: string | null;
          updatedAt?: string | null;
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
