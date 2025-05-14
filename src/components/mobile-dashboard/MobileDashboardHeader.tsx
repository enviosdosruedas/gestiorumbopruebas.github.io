
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, CalendarDays } from 'lucide-react';
import { logoutDriverAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MobileDashboardHeaderProps {
  driverName: string;
}

export default function MobileDashboardHeader({ driverName }: MobileDashboardHeaderProps) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es }));
  }, []);

  const handleLogout = async () => {
    // In a real app, this would redirect or handle session invalidation
    const result = await logoutDriverAction();
    if (result.success) {
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
      // router.push('/login'); // Example redirect
    } else {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-primary text-primary-foreground p-3 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            <h1 className="text-lg font-semibold">{driverName}</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs opacity-90 mt-0.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{currentDate}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
