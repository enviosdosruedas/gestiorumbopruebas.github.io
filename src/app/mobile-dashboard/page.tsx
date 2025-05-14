
import type { Metadata } from 'next';
import { getDriverDashboardTasks, getDriverInfo } from '@/app/actions';
import MobileDashboardHeader from '@/components/mobile-dashboard/MobileDashboardHeader';
import MobileTaskListSection from '@/components/mobile-dashboard/MobileTaskListSection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, ListChecks, Navigation } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Ensure data is fresh for the driver

export const metadata: Metadata = {
  title: 'Panel de Repartidor - Rumbo Envios',
  description: 'Gestione sus entregas diarias.',
};

// TODO: Replace with actual logged-in driver ID from session/auth
const MOCK_DRIVER_ID = "a0e0b1e9-1b21-4967-9783-b0a620530b0e"; // Example UUID

export default async function MobileDashboardPage() {
  const driverId = MOCK_DRIVER_ID; // Replace with actual dynamic driver ID
  
  let driverInfo = null;
  let dashboardData = { inProgress: [], assigned: [], completed: [] };
  let errorLoadingData = null;

  try {
    driverInfo = await getDriverInfo(driverId);
    if (driverInfo) {
      dashboardData = await getDriverDashboardTasks(driverId);
    } else {
      errorLoadingData = "No se pudo cargar la información del repartidor.";
    }
  } catch (error) {
    console.error("Error loading mobile dashboard data:", error);
    errorLoadingData = "Ocurrió un error al cargar los datos del panel.";
  }

  if (errorLoadingData || !driverInfo) {
    return (
      <div className="min-h-screen bg-muted p-4 flex flex-col items-center justify-center">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error de Carga</AlertTitle>
          <AlertDescription>
            {errorLoadingData || "No se pudo identificar al repartidor."} Por favor, intente recargar la página o contacte a soporte.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileDashboardHeader driverName={driverInfo.nombre} />
      
      <main className="flex-grow p-3 space-y-4">
        <MobileTaskListSection
          title="En Progreso"
          tasks={dashboardData.inProgress}
          icon={<Navigation className="h-5 w-5 text-primary" />}
          emptyStateMessage="No tienes entregas en progreso."
          driverId={driverId}
        />
        <MobileTaskListSection
          title="Asignadas para Hoy"
          tasks={dashboardData.assigned}
          icon={<ListChecks className="h-5 w-5 text-blue-500" />}
          emptyStateMessage="No hay más entregas asignadas por hoy."
          driverId={driverId}
        />
        <MobileTaskListSection
          title="Completadas Hoy"
          tasks={dashboardData.completed}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          emptyStateMessage="Aún no has completado entregas hoy."
          driverId={driverId}
        />
      </main>
    </div>
  );
}
