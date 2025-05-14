'use client';

import type { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteClientAction } from '@/app/actions';
import { Edit, Trash2, ListChecks, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDeleteSuccess: () => void;
  isLoading?: boolean;
}

export default function ClientList({ clients, onEdit, onDeleteSuccess, isLoading: isListLoading }: ClientListProps) {
  const { toast } = useToast();
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  const handleDelete = async (clientId: string) => {
    setDeletingClientId(clientId);
    try {
      const result = await deleteClientAction(clientId);
      if (result.success) {
        toast({
          title: 'Client Deleted',
          description: 'The client has been successfully deleted.',
        });
        onDeleteSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete client.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete client error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the client.',
        variant: 'destructive',
      });
    } finally {
      setDeletingClientId(null);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Client List
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isListLoading && (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading clients...</p>
            </div>
        )}
        {!isListLoading && clients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <p>No clients found. Add a new client to get started.</p>
            </div>
        )}
        {!isListLoading && clients.length > 0 && (
          <Table>
            <TableCaption>A list of your clients.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address (User Input)</TableHead>
                <TableHead>Validated Address</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.clientCode}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>{client.validatedAddress || 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    {client.isAddressValid === true && (
                      <Badge variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <CheckCircle className="mr-1 h-4 w-4" /> Valid
                      </Badge>
                    )}
                    {client.isAddressValid === false && (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-4 w-4" /> Invalid
                      </Badge>
                    )}
                    {client.isAddressValid === undefined || client.isAddressValid === null && (
                       <Badge variant="secondary">
                         Pending
                       </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(client)} disabled={deletingClientId === client.id}>
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingClientId === client.id}>
                          {deletingClientId === client.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                           Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the client "{client.name}" and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(client.id)} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete client
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
