
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { MobileDashboardTask } from '@/types';

interface MobileInProgressMapProps {
  task: MobileDashboardTask | null; // The current "in progress" task
}

// IMPORTANT: This is a placeholder. Real map integration requires a library like
// react-leaflet, @react-google-maps/api, or Mapbox GL JS, plus API keys.
export default function MobileInProgressMap({ task }: MobileInProgressMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching API key or map setup
    // In a real app, the key might come from env vars accessible on client
    // or a dedicated backend endpoint if it needs to be kept more secure.
    // For this example, we'll assume it's NEXT_PUBLIC for simplicity.
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_MOBILE; // Or your preferred map provider key
    if (key) {
      setApiKey(key);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="py-2 px-3 border-b">
          <CardTitle className="text-sm font-medium">Mapa de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-48 flex items-center justify-center bg-muted">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!apiKey) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="py-2 px-3 border-b">
          <CardTitle className="text-sm font-medium">Mapa de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-48 flex flex-col items-center justify-center bg-muted text-center">
          <AlertTriangle className="h-6 w-6 text-destructive mb-1" />
          <p className="text-xs text-destructive-foreground">
            Servicio de mapa no configurado. (API Key faltante)
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!task || !task.cliente_reparto_direccion) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="py-2 px-3 border-b">
          <CardTitle className="text-sm font-medium">Mapa de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-48 flex items-center justify-center bg-muted">
          <p className="text-xs text-muted-foreground">No hay tarea en progreso o dirección disponible.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Placeholder for actual map rendering
  // Example using an iframe for Google Maps (replace with a proper library for better UX)
  const mapSrc = \`https://maps.google.com/maps?q=\${encodeURIComponent(task.cliente_reparto_direccion)}&hl=es&z=14&output=embed\`;

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-2 px-3 border-b">
        <CardTitle className="text-sm font-medium">Próxima Entrega: {task.cliente_reparto_nombre}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-64 md:h-80">
        {/* 
          This is a very basic way to show a map.
          For production, use a dedicated library like @react-google-maps/api or react-leaflet
          which offers more control, interactivity, and better performance.
        */}
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapSrc}
          title={`Mapa a \${task.cliente_reparto_direccion}`}
          data-ai-hint="map delivery location"
        ></iframe>
      </CardContent>
    </Card>
  );
}
