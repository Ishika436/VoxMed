import { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ icon: Icon, label, value, trend, trendUp }: StatCardProps) => (
  <GlassCard className="flex items-start gap-4">
    <div className="p-3 rounded-lg bg-primary/10">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-display font-bold mt-1">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 ${trendUp ? "text-success" : "text-destructive"}`}>
          {trendUp ? "↑" : "↓"} {trend}
        </p>
      )}
    </div>
  </GlassCard>
);

export default StatCard;
