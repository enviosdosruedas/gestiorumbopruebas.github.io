'use server';

import type { Client, ClientFormData } from '@/types';
import { validateAddress, type ValidateAddressOutput } from '@/ai/flows/validate-address';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { clientSchema } from '@/lib/schema';

// In-memory store for clients (replace with actual Supabase client)
let clients: Client[] = [
  {
    id: '1',
    clientCode: 'C001',
    name: 'John Doe',
    address: 'Av. Colón 1234, Mar del Plata',
    validatedAddress: 'Avenida Cristobal Colón 1234, B7600 Mar del Plata, Provincia de Buenos Aires, Argentina',
    isAddressValid: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    clientCode: 'C002',
    name: 'Jane Smith',
    address: 'Belgrano 2345, MDP',
    validatedAddress: 'Manuel Belgrano 2345, B7600 Mar del Plata, Provincia de Buenos Aires, Argentina',
    isAddressValid: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Helper function to simulate database interaction
const simulateDBDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export async function getClients(): Promise<Client[]> {
  await simulateDBDelay();
  // Sort by name for consistent order
  return [...clients].sort((a, b) => a.name.localeCompare(b.name));
}

export async function addClientAction(formData: ClientFormData): Promise<{ success: boolean; client?: Client; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = clientSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { clientCode, name, address } = validationResult.data;

  // Check for duplicate client code
  if (clients.some(c => c.clientCode === clientCode)) {
    return { success: false, message: 'Client code already exists.' };
  }
  
  let validatedAddressInfo: ValidateAddressOutput;
  try {
    validatedAddressInfo = await validateAddress({ address });
  } catch (error) {
    console.error('AI Address Validation Error:', error);
    return { success: false, message: 'Error validating address with AI. Please try again.' };
  }

  const newClient: Client = {
    id: String(Date.now()), // Simple unique ID for demo
    clientCode,
    name,
    address, // Original user input
    validatedAddress: validatedAddressInfo.isValid ? validatedAddressInfo.validatedAddress : null,
    isAddressValid: validatedAddressInfo.isValid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await simulateDBDelay();
  clients.push(newClient);
  revalidatePath('/');
  return { success: true, client: newClient };
}

export async function updateClientAction(id: string, formData: ClientFormData): Promise<{ success: boolean; client?: Client; errors?: z.ZodIssue[]; message?: string }> {
  const validationResult = clientSchema.safeParse(formData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.errors };
  }

  const { clientCode, name, address } = validationResult.data;
  
  const clientIndex = clients.findIndex(c => c.id === id);
  if (clientIndex === -1) {
    return { success: false, message: 'Client not found.' };
  }

  // Check for duplicate client code (excluding the current client being updated)
  if (clients.some(c => c.id !== id && c.clientCode === clientCode)) {
    return { success: false, message: 'Client code already exists for another client.' };
  }

  let validatedAddressInfo: ValidateAddressOutput;
  try {
    validatedAddressInfo = await validateAddress({ address });
  } catch (error) {
    console.error('AI Address Validation Error:', error);
    return { success: false, message: 'Error validating address with AI. Please try again.' };
  }
  
  const updatedClient: Client = {
    ...clients[clientIndex],
    clientCode,
    name,
    address, // Original user input
    validatedAddress: validatedAddressInfo.isValid ? validatedAddressInfo.validatedAddress : null,
    isAddressValid: validatedAddressInfo.isValid,
    updatedAt: new Date().toISOString(),
  };

  await simulateDBDelay();
  clients[clientIndex] = updatedClient;
  revalidatePath('/');
  return { success: true, client: updatedClient };
}

export async function deleteClientAction(id: string): Promise<{ success: boolean; message?: string }> {
  await simulateDBDelay();
  const initialLength = clients.length;
  clients = clients.filter(client => client.id !== id);
  
  if (clients.length === initialLength) {
    return { success: false, message: 'Client not found or already deleted.' };
  }

  revalidatePath('/');
  return { success: true };
}
