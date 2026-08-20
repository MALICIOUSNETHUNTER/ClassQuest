import { PropsWithChildren } from 'react';

type Variant = 'default' | 'destructive' | 'success' | 'warning';

interface FormMessageProps {
  variant?: Variant;
  children: React.ReactNode;
}

export function FormMessage({
  children,
  variant = 'default'
}: PropsWithChildren<FormMessageProps>) {
  const baseClasses = 'text-sm text-center mt-2';

  const variantClasses = {
    default: 'text-muted-foreground',
    destructive: 'text-destructive',
    success: 'text-success',
    warning: 'text-warning',
  }[variant] || 'text-muted-foreground';

  return (
    <p className={`${baseClasses} ${variantClasses}`}>
      {children}
    </p>
  );
}