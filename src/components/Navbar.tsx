'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/Clientes', label: 'Clientes' },
  { href: '/Repartidores', label: 'Repartidores' },
  { href: '/ClientesReparto', label: 'Clientes de Reparto' },
  // Agrega más enlaces aquí si es necesario
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navLinks.map((link) => (
          <NavigationMenuItem key={link.href}>
            <Link href={link.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  'text-sm font-medium', // Asegura que el texto sea legible
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90' // Estilo activo más prominente
                    : 'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                )}
                active={pathname === link.href}
              >
                {link.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
