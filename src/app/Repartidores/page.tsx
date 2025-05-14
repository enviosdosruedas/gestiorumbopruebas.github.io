import RepartidoresManagement from '@/components/repartidores/RepartidoresManagement';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestión de Repartidores - Rumbo Envios',
  description: 'Administre sus repartidores y sus rutas.',
};

export default function RepartidoresPage() {
  return <RepartidoresManagement />;
}
