
import type { Metadata } from 'next';
import { getDeliveryClientInfos, getClients } from '@/app/actions';
import ClientesRepartoManagement from '@/components/clientes-reparto/ClientesRepartoManagement';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Clientes de Reparto - Rumbo Envios',
  description: 'Gestione los clientes específicos para operaciones de reparto.',
};

export default async function ClientesRepartoPage() {
  const deliveryClientInfos = await getDeliveryClientInfos();
  const clients = await getClients(); // Para el selector en el formulario
  return <ClientesRepartoManagement initialDeliveryClientInfos={deliveryClientInfos} allClients={clients} />;
}
