'use client';

import type { Client } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import ClientForm from './ClientForm';
import ClientList from './ClientList';
import { getClients as getClientsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface ClientManagementProps {
  initialClients: Client[];
}

export default function ClientManagement({ initialClients }: ClientManagementProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const { toast } = useToast();

  const refreshClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const updatedClients = await getClientsAction();
      setClients(updatedClients);
    } catch (error) {
      console.error("Failed to refresh clients:", error);
      toast({
        title: 'Error',
        description: 'Could not refresh client list.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingClients(false);
    }
  }, [toast]);
  
  // Effect to update local client list if initialClients prop changes (e.g., due to revalidatePath)
  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = () => {
    setEditingClient(null); // Clear editing state
    refreshClients(); // Refresh the client list
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
  };

  const handleDeleteSuccess = () => {
    refreshClients(); // Refresh the client list
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <ClientForm
        key={editingClient ? editingClient.id : 'new-client-form'} // Ensures form resets when editingClient changes
        initialClientData={editingClient}
        onSuccess={handleFormSuccess}
        onCancel={editingClient ? handleCancelEdit : undefined}
      />
      <Separator />
      <ClientList
        clients={clients}
        onEdit={handleEdit}
        onDeleteSuccess={handleDeleteSuccess}
        isLoading={isLoadingClients}
      />
    </div>
  );
}
