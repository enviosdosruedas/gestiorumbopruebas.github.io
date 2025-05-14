import ClientesRepartoManagement from '@/components/clientes-reparto/ClientesRepartoManagement';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clientes de Reparto - Rumbo Envios',
  description: 'Gestione los clientes específicos para operaciones de reparto.',
};

export default function ClientesRepartoPage() {
  return <ClientesRepartoManagement />;
}
