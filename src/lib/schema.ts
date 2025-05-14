import { z } from 'zod';

export const clientSchema = z.object({
  clientCode: z.string().min(1, "Client code is required").max(50, "Client code must be 50 characters or less"),
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  address: z.string().min(1, "Address is required").max(200, "Address must be 200 characters or less"),
});

export type ClientFormData = z.infer<typeof clientSchema>;
