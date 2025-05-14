
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Users, Truck, ClipboardList, PackagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

// Map icon names to actual Lucide components
const iconMap: { [key: string]: LucideIcon } = {
  Users,
  Truck,
  ClipboardList,
  PackagePlus,
};

interface ActionCardProps {
  iconName: string; // Changed from icon: LucideIcon to iconName: string
  title: string;
  description: string;
  href: string;
  actionText?: string;
}

export function ActionCard({ iconName, title, description, href, actionText = "Ir a la sección" }: ActionCardProps) {
  const IconComponent = iconMap[iconName] || Users; // Default to Users icon if not found

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-3">
            <IconComponent className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">{title}</CardTitle>
          </div>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {/* Se puede agregar contenido adicional aquí si es necesario en el futuro */}
        </CardContent>
        <CardFooter>
          <Link href={href} passHref legacyBehavior>
            <Button className="w-full" variant="default">
              {actionText} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
