
import type { Metadata } from 'next';
import { getRepartos, getClients, getRepartidores, getZonas } from '@/app/actions'; // Added getZonas
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
  const zonas = await getZonas(); // Fetch zonas

  // Note: allDeliveryClientInfos was previously fetched here.
  // It's now fetched dynamically within RepartoForm based on the selected cliente_id.
  // If you need a pre-cached list for some other purpose, you can fetch it here.

  return (
    <RepartosManagement
      initialRepartos={repartos}
      allClientes={clientes}
      allRepartidores={repartidores}
      allZonas={zonas} // Pass zonas
    />
  );
}

    