import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";
import { format } from "date-fns";
import { Mic, Activity, Trash2 } from "lucide-react";
import { toast } from "sonner";

const HistoryPage = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecordings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("voice_recordings")
      .select("*, biomarker_analyses(*)")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false });
    setRecordings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRecordings(); }, [user]);

  const deleteRecording = async (id: string) => {
    const { error } = await supabase.from("voice_recordings").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Recording deleted");
    fetchRecordings();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Recording History</h1>
        <p className="text-muted-foreground mt-1">Browse all your voice diary entries</p>
      </div>

      {recordings.length === 0 && !loading ? (
        <GlassCard className="text-center py-12">
          <Mic className="w-12 h-12 text-primary/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No recordings yet</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {recordings.map((rec) => {
            const analysis = rec.biomarker_analyses?.[0];
            return (
              <GlassCard key={rec.id} className="flex items-center gap-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {format(new Date(rec.recorded_at), "MMM dd, yyyy · hh:mm a")}
                  </p>
                  {rec.notes && <p className="text-xs text-muted-foreground truncate mt-0.5">{rec.notes}</p>}
                  <p className="text-xs text-muted-foreground font-mono mt-1">{rec.duration_seconds}s recording</p>
                </div>
                {analysis && (
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-display font-bold text-primary">{Number(analysis.overall_health_score).toFixed(0)}%</p>
                      <p className="text-[10px] font-mono text-muted-foreground">Health</p>
                    </div>
                    {analysis.anomaly_detected && (
                      <Activity className="w-5 h-5 text-destructive animate-pulse" />
                    )}
                  </div>
                )}
                <button
                  onClick={() => deleteRecording(rec.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
