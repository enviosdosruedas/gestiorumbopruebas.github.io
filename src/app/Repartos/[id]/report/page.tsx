
import type { Metadata } from 'next';
import { getRepartoByIdForReport } from '@/app/actions';
import RepartoReportView from '@/components/repartos/RepartoReportView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface ReportPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const repartoId = parseInt(params.id, 10);
  if (isNaN(repartoId)) {
    return { title: 'Error - Reporte de Reparto', description: 'ID de reparto inválido.' };
  }
  // Podrías obtener el nombre del cliente/fecha del reparto para un título más específico
  return {
    title: `Reporte Reparto #${repartoId} - Rumbo Envios`,
    description: `Detalle del reporte para el reparto ID ${repartoId}.`,
  };
}

export default async function RepartoReportPage({ params }: ReportPageProps) {
  const repartoId = parseInt(params.id, 10);

  if (isNaN(repartoId)) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
        <p>El ID del reparto proporcionado no es válido.</p>
        <Link href="/Repartos" passHref>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Repartos
          </Button>
        </Link>
      </div>
    );
  }

  const { reparto, error } = await getRepartoByIdForReport(repartoId);

  if (error || !reparto) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error al Cargar el Reporte</h1>
        <p>{error || 'No se pudo encontrar el reparto solicitado.'}</p>
        <Link href="/Repartos" passHref>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Repartos
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="print-container container mx-auto p-4 md:p-8">
       <div className="print-header hidden print:flex justify-between items-center mb-4 pb-2 border-b">
        <Image src="/favicon.svg" alt="Rumbo Envios Logo" width={150} height={50} className="print-logo" data-ai-hint="company logo"/>
        <h1 className="text-xl font-semibold">Reporte de Reparto</h1>
      </div>
      <RepartoReportView reparto={reparto} />
    </div>
  );
}

    