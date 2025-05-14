
'use client';

import type { Reparto } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Printer, CalendarDays, User, Users, Map, Clock4, ListChecks, Info, DollarSign, FileText, Hash, MapPin, Watch, AlertOctagon, StickyNote } from 'lucide-react';
import Link from 'next/link';
import type { VariantProps } from 'class-variance-authority';

interface RepartoReportViewProps {
  reparto: Reparto;
}

const ClientSideFormattedDate = ({ dateString, formatString = 'PPP' }: { dateString?: string | null, formatString?: string }) => {
  const [displayText, setDisplayText] = React.useState<string>('...'); // Evitar Math.random()
  React.useEffect(() => {
    if (dateString) {
      try {
        const date = parseISO(dateString); 
        setDisplayText(format(date, formatString, { locale: es }));
      } catch (error) {
        try {
            const directDate = new Date(dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3')); 
            setDisplayText(format(directDate, formatString, { locale: es }));
        } catch (innerError) {
            console.error("Error formatting date:", innerError);
            setDisplayText('Fecha inválida');
        }
      }
    } else {
      setDisplayText('N/A');
    }
  }, [dateString, formatString]);
  return <>{displayText}</>;
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
};

const getStatusVariant = (status?: string | null): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status?.toLowerCase()) {
      case "pendiente": return "pendiente";
      case "en curso": return "en-curso";
      case "entregado": return "entregado";
      case "cancelado": return "cancelado";
      case "reprogramado": return "reprogramado";
      default: return "outline";
    }
  };


export default function RepartoReportView({ reparto }: RepartoReportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalParadas = reparto.detalles_reparto?.length || 0;
  const valorTotalACobrar = reparto.detalles_reparto?.reduce((sum, item) => sum + (item.valor_entrega || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
            <h1 className="text-3xl font-bold text-primary">Reporte del Reparto #{reparto.id}</h1>
            <p className="text-muted-foreground">
                Fecha del Reparto: <ClientSideFormattedDate dateString={reparto.fecha_reparto} />
            </p>
        </div>
        <div className="flex gap-2">
          <Link href="/Repartos" passHref>
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Repartos</Button>
          </Link>
          <Button onClick={handlePrint} className="print-button-show"><Printer className="mr-2 h-4 w-4" /> Exportar / Imprimir</Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><FileText className="h-5 w-5 text-primary"/>Resumen del Reparto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
          <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><strong>Fecha:</strong> <ClientSideFormattedDate dateString={reparto.fecha_reparto} /></div>
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><strong>Repartidor:</strong> {reparto.repartidor_nombre || 'N/A'}</div>
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><strong>Cliente Principal:</strong> {reparto.cliente_principal_nombre || 'Reparto General'}</div>
          <div className="flex items-center gap-2"><Map className="h-4 w-4 text-muted-foreground" /><strong>Zona:</strong> {reparto.zona_nombre || 'N/A'}</div>
          <div className="flex items-center gap-2"><Clock4 className="h-4 w-4 text-muted-foreground" /><strong>Tanda:</strong> {reparto.tanda || 'N/A'}</div>
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /><strong>Estado:</strong> <Badge variant={getStatusVariant(reparto.estado)}>{reparto.estado || 'N/A'}</Badge></div>
          <div className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-muted-foreground" /><strong>Total de Paradas:</strong> {totalParadas}</div>
          <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><strong>Valor Total a Cobrar:</strong> {formatCurrency(valorTotalACobrar)}</div>
          {reparto.observaciones && <div className="md:col-span-2 lg:col-span-3 flex items-start gap-2"><Info className="h-4 w-4 text-muted-foreground mt-1" /><strong>Observaciones Generales:</strong> <p className="flex-1">{reparto.observaciones}</p></div>}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><ListChecks className="h-5 w-5 text-primary"/>Detalle de Paradas</CardTitle>
          <CardDescription>Listado de todas las entregas programadas para este reparto.</CardDescription>
        </CardHeader>
        <CardContent>
          {totalParadas === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay ítems de entrega para este reparto.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"><Hash className="inline-block h-4 w-4"/>#</TableHead>
                    <TableHead><Users className="inline-block h-4 w-4 mr-1"/>Cliente Destino</TableHead>
                    <TableHead><MapPin className="inline-block h-4 w-4 mr-1"/>Dirección</TableHead>
                    <TableHead><Watch className="inline-block h-4 w-4 mr-1"/>Horario Preferido</TableHead>
                    <TableHead><AlertOctagon className="inline-block h-4 w-4 mr-1"/>Restricciones</TableHead>
                    <TableHead className="text-right"><DollarSign className="inline-block h-4 w-4 mr-1"/>Valor</TableHead>
                    <TableHead><StickyNote className="inline-block h-4 w-4 mr-1"/>Notas Entrega</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reparto.detalles_reparto?.map((item) => (
                    <TableRow key={item.id || item.orden_visita}>
                      <TableCell>{item.orden_visita + 1}</TableCell>
                      <TableCell>{item.cliente_reparto_nombre || 'N/A'}</TableCell>
                      <TableCell>{item.cliente_reparto_direccion || 'N/A'}</TableCell>
                      <TableCell>{item.cliente_reparto_horario_preferido || 'N/A'}</TableCell>
                      <TableCell>{item.cliente_reparto_restricciones || 'N/A'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valor_entrega)}</TableCell>
                      <TableCell>{item.detalle_entrega || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
       <div className="mt-8 text-center no-print">
        <Link href="/Repartos" passHref>
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Repartos</Button>
        </Link>
      </div>
    </div>
  );
}

    