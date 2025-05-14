
import { getRepartidores } from '@/app/actions';
import RepartidoresManagement from '@/components/repartidores/RepartidoresManagement';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestión de Repartidores - Rumbo Envios',
  description: 'Administre sus repartidores y sus rutas.',
};

export default async function RepartidoresPage() {
  const repartidores = await getRepartidores();
  return <RepartidoresManagement initialRepartidores={repartidores} />;
}
