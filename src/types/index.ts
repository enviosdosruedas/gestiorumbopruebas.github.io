export interface Client {
  id: string; // Assuming UUID from Supabase or generated ID
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
