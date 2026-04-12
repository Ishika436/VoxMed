import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { toast } from "sonner";

const AlertsPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchAlerts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("health_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAlerts(data || []);
  };

  useEffect(() => { fetchAlerts(); }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("health_alerts").update({ is_read: true }).eq("id", id);
    toast.success("Alert marked as read");
    fetchAlerts();
  };

  const severityStyles: Record<string, string> = {
    high: "border-destructive/50 bg-destructive/5",
    medium: "border-warning/50 bg-warning/5",
    low: "border-info/50 bg-info/5",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Health Alerts</h1>
        <p className="text-muted-foreground mt-1">Notifications about abnormal voice patterns</p>
      </div>

      {alerts.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Bell className="w-12 h-12 text-primary/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No alerts — you're doing great!</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`glass rounded-xl p-5 border ${severityStyles[alert.severity] || ""} ${alert.is_read ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  alert.severity === "high" ? "text-destructive" : alert.severity === "medium" ? "text-warning" : "text-info"
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{alert.severity} severity</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(alert.created_at), "MMM dd, hh:mm a")}</span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="p-2 rounded-lg hover:bg-success/10 text-muted-foreground hover:text-success transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
