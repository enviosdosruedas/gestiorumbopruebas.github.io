import { getClients } from '@/app/actions';
import ClientManagement from '@/components/ClientManagement';

// Make this page dynamic to ensure server actions and revalidation work as expected.
// This could also be achieved by using `export const revalidate = 0;` or specific revalidation tags.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const clients = await getClients();
  return <ClientManagement initialClients={clients} />;
}
