import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";
import { toast } from "sonner";
import { Pill, Plus, Check, X, Trash2, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MedicationsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("medication_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);
    setLogs(data || []);
  };

  useEffect(() => { fetchLogs(); }, [user]);

  const addLog = async () => {
    if (!user || !medName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("medication_logs").insert({
      user_id: user.id,
      medication_name: medName.trim(),
      dosage: dosage.trim() || null,
      scheduled_time: scheduledTime || null,
    });
    if (error) toast.error("Failed to add");
    else {
      toast.success("Medication logged!");
      setMedName(""); setDosage(""); setScheduledTime(""); setShowForm(false);
      fetchLogs();
    }
    setSaving(false);
  };

  const toggleTaken = async (id: string, currentValue: boolean) => {
    await supabase.from("medication_logs").update({
      was_taken: !currentValue,
      taken_at: !currentValue ? new Date().toISOString() : null,
    }).eq("id", id);
    fetchLogs();
  };

  const deleteLog = async (id: string) => {
    await supabase.from("medication_logs").delete().eq("id", id);
    toast.success("Deleted");
    fetchLogs();
  };

  // Adherence chart — last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayLogs = logs.filter((l) => l.log_date === dateStr);
    const taken = dayLogs.filter((l) => l.was_taken).length;
    const total = dayLogs.length;
    return {
      day: format(date, "EEE"),
      adherence: total > 0 ? Math.round((taken / total) * 100) : 0,
      taken,
      total,
    };
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLogs = logs.filter((l) => l.log_date === todayStr);
  const pastLogs = logs.filter((l) => l.log_date !== todayStr);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Medications</h1>
          <p className="text-muted-foreground mt-1">Track your daily medication intake</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg gradient-primary font-display text-xs font-semibold text-primary-foreground tracking-wider hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> LOG MEDICATION
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <GlassCard className="animate-fade-in">
          <h3 className="font-display font-semibold mb-4">Log New Medication</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Medication Name *</label>
              <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Levodopa" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Dosage</label>
              <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. 100mg" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Scheduled Time</label>
              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addLog} disabled={saving || !medName.trim()}
              className="px-6 py-2 rounded-lg gradient-primary font-display text-xs font-semibold text-primary-foreground tracking-wider disabled:opacity-50">
              {saving ? "Saving..." : "ADD"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2 rounded-lg bg-secondary text-muted-foreground text-xs font-semibold hover:text-foreground transition">
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      {/* Adherence chart */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">7-Day Adherence</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 18%)" />
            <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(215, 20%, 18%)", borderRadius: "8px", color: "hsl(190, 100%, 95%)" }}
              formatter={(value: number) => [`${value}%`, "Adherence"]}
            />
            <Bar dataKey="adherence" fill="hsl(185, 100%, 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Today's meds */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Today</h2>
        {todayLogs.length === 0 ? (
          <GlassCard className="text-center py-8">
            <Pill className="w-10 h-10 text-primary/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No medications logged today</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {todayLogs.map((log) => (
              <GlassCard key={log.id} className="flex items-center gap-4 !py-4">
                <button onClick={() => toggleTaken(log.id, log.was_taken)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    log.was_taken ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}>
                  {log.was_taken ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${log.was_taken ? "line-through text-muted-foreground" : ""}`}>{log.medication_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.dosage && <span>{log.dosage}</span>}
                    {log.scheduled_time && <span> · {log.scheduled_time}</span>}
                    {log.was_taken && log.taken_at && <span> · Taken at {format(new Date(log.taken_at), "hh:mm a")}</span>}
                  </p>
                </div>
                <button onClick={() => deleteLog(log.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Past logs */}
      {pastLogs.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">Past Entries</h2>
          <div className="space-y-2">
            {pastLogs.slice(0, 20).map((log) => (
              <GlassCard key={log.id} className="flex items-center gap-4 !py-4 opacity-70">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.was_taken ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                  {log.was_taken ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{log.medication_name}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(log.log_date), "MMM dd, yyyy")}{log.dosage && ` · ${log.dosage}`}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
