import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre debe tener 100 caracteres o menos"),
  address: z.string().min(1, "La dirección es requerida").max(200, "La dirección debe tener 200 caracteres o menos"),
  telefono: z.string().max(20, "El teléfono debe tener 20 caracteres o menos").optional().nullable().or(z.literal('')),
  email: z.string().email({ message: "Email inválido" }).max(100, "El email debe tener 100 caracteres o menos").optional().nullable().or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;
