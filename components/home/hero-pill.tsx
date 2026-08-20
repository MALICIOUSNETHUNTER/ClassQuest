import { cn } from "@/lib/utils";

interface HeroPillProps {
  variant: "purple" | "indigo" | "blue";
  children: React.ReactNode;
}

export function HeroPill({ variant, children }: HeroPillProps) {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1";

  const variantClasses = {
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600"
  }[variant];

  return (
    <span className={cn(baseClasses, variantClasses)}>
      {children}
    </span>
  );
}