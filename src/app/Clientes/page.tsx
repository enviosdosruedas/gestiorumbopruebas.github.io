import { getClients } from '@/app/actions';
import ClientManagement from '@/components/clientes/ClientManagement';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestión de Clientes - Rumbo Envios',
  description: 'Administre sus clientes',
};

export default async function ClientesPage() {
  const clients = await getClients();
  return <ClientManagement initialClients={clients} />;
}
