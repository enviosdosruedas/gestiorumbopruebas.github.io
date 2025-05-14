
import type { Metadata } from 'next';
import { HeroSection } from '@/components/inicio/HeroSection';
import { ActionCard } from '@/components/inicio/ActionCard';
// Icons are no longer directly imported here for passing as props,
// their names will be passed as strings to ActionCard.

export const metadata: Metadata = {
  title: 'Panel de Control - Rumbo Envios',
  description: 'Panel de control principal para la gestión de Rumbo Envios.',
};

const actions = [
  {
    iconName: 'Users', // Changed from icon: Users
    title: 'Gestionar Clientes',
    description: 'Administre su base de datos de clientes, actualice información y realice seguimientos.',
    href: '/Clientes',
    actionText: 'Ver Clientes',
  },
  {
    iconName: 'Truck', // Changed from icon: Truck
    title: 'Gestionar Repartidores',
    description: 'Organice su equipo de repartidores, asigne vehículos y supervise sus zonas de trabajo.',
    href: '/Repartidores',
    actionText: 'Ver Repartidores',
  },
  {
    iconName: 'ClipboardList', // Changed from icon: ClipboardList
    title: 'Clientes de Reparto',
    description: 'Defina puntos de entrega específicos para clientes recurrentes, con horarios y tarifas personalizadas.',
    href: '/ClientesReparto',
    actionText: 'Ver Clientes de Reparto',
  },
  {
    iconName: 'PackagePlus', // Changed from icon: PackagePlus
    title: 'Gestionar Repartos',
    description: 'Cree nuevas hojas de ruta, asigne repartos a repartidores y realice el seguimiento del estado de las entregas.',
    href: '/Repartos',
    actionText: 'Ver Repartos',
  },
];

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <HeroSection />
      <div className="mt-12 md:mt-16">
        <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">
          Acciones Principales
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {actions.map((action) => (
            <ActionCard
              key={action.href}
              iconName={action.iconName} // Pass iconName as string
              title={action.title}
              description={action.description}
              href={action.href}
              actionText={action.actionText}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
