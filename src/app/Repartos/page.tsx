
import type { Metadata } from 'next';
import { getRepartos, getClients, getRepartidores, getDeliveryClientInfos } from '@/app/actions';
import RepartosManagement from '@/components/repartos/RepartosManagement';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestión de Repartos - Rumbo Envios',
  description: 'Asigne y administre sus repartos.',
};

export default async function RepartosPage() {
  const repartos = await getRepartos();
  const clientes = await getClients();
  const repartidores = await getRepartidores();
  const allDeliveryClientInfos = await getDeliveryClientInfos(); // Para el formulario

  return (
    <RepartosManagement
      initialRepartos={repartos}
      allClientes={clientes}
      allRepartidores={repartidores}
      allDeliveryClientInfos={allDeliveryClientInfos}
    />
  );
}
