import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLAnchorElement> {
  // iconProps ya no es necesario ya que usamos un componente Image
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-primary", className)} {...props}>
      <Image
        src="/favicon.ico"
        alt="Rumbo Envios Logo"
        width={28} // Equivalente a h-7 w-7, ajusta si es necesario
        height={28} // Equivalente a h-7 w-7, ajusta si es necesario
        className="rounded-sm" // Opcional: para un ligero redondeo si el favicon es cuadrado
        data-ai-hint="company logo"
      />
      <span className="text-2xl font-bold">Rumbo Envios</span>
    </Link>
  );
}
