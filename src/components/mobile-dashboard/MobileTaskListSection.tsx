
'use client';

import type { MobileDashboardTask } from '@/types';
import MobileTaskCard from './MobileTaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react'; // Import React

interface MobileTaskListSectionProps {
  title: string;
  tasks: MobileDashboardTask[];
  icon?: React.ReactNode;
  emptyStateMessage?: string;
  driverId: string; // Needed for potential actions within cards
}

export default function MobileTaskListSection({
  title,
  tasks,
  icon,
  emptyStateMessage = "No hay tareas en esta sección.",
  driverId,
}: MobileTaskListSectionProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
          <span className="text-sm font-normal bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <MobileTaskCard key={task.id} task={task} driverId={driverId} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 px-2">{emptyStateMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
