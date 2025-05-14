import { Building2 } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconProps?: LucideProps;
}

export function Logo({ className, iconProps, ...props }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 text-primary ${className || ''}`} {...props}>
      <Building2 className="h-7 w-7" {...iconProps} />
      <span className="text-2xl font-bold">Rumbo Envios</span>
    </div>
  );
}
