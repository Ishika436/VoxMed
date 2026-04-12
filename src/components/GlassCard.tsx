import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

const GlassCard = ({ children, className, glow }: GlassCardProps) => (
  <div className={cn("glass rounded-xl p-6", glow && "glow-primary", className)}>
    {children}
  </div>
);

export default GlassCard;
