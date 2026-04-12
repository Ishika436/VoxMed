import { useEffect, useState } from "react";
import { Activity, Mic, Brain, AlertTriangle, TrendingUp, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StatCard from "@/components/StatCard";
import GlassCard from "@/components/GlassCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [recordingCount, setRecordingCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ data: analysesData }, { count: recCount }, { count: alertCnt }] = await Promise.all([
        supabase.from("biomarker_analyses").select("*").eq("user_id", user.id).order("analyzed_at", { ascending: true }).limit(30),
        supabase.from("voice_recordings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("health_alerts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
      ]);
      setAnalyses(analysesData || []);
      setRecordingCount(recCount || 0);
      setAlertCount(alertCnt || 0);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const latestAnalysis = analyses[analyses.length - 1];
  const chartData = analyses.map((a) => ({
    date: format(new Date(a.analyzed_at), "MMM dd"),
    health: Number(a.overall_health_score),
    tremor: Number(a.tremor_score),
    breathlessness: Number(a.breathlessness_score),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your vocal health at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Heart} label="Health Score" value={latestAnalysis ? `${latestAnalysis.overall_health_score}%` : "—"} trend={latestAnalysis ? "from latest scan" : undefined} trendUp />
        <StatCard icon={Mic} label="Recordings" value={recordingCount} />
        <StatCard icon={Brain} label="Analyses" value={analyses.length} />
        <StatCard icon={AlertTriangle} label="Unread Alerts" value={alertCount} trendUp={alertCount === 0} trend={alertCount === 0 ? "All clear" : `${alertCount} need attention`} />
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <GlassCard>
          <h2 className="font-display text-lg font-semibold mb-4">Health Score Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 18%)" />
              <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 10%)",
                  border: "1px solid hsl(215, 20%, 18%)",
                  borderRadius: "8px",
                  color: "hsl(190, 100%, 95%)",
                }}
              />
              <Area type="monotone" dataKey="health" stroke="hsl(185, 100%, 50%)" fill="url(#healthGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      ) : (
        <GlassCard className="text-center py-12">
          <Mic className="w-12 h-12 text-primary/40 mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">No recordings yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Start your voice diary to track your health biomarkers</p>
          <Link to="/record" className="inline-block px-6 py-3 rounded-lg gradient-primary font-display text-sm font-semibold text-primary-foreground tracking-wider hover:opacity-90 transition">
            Record Now
          </Link>
        </GlassCard>
      )}

      {/* Latest biomarkers */}
      {latestAnalysis && (
        <GlassCard>
          <h2 className="font-display text-lg font-semibold mb-4">Latest Biomarker Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Tremor", value: latestAnalysis.tremor_score, color: "text-primary" },
              { label: "Breathlessness", value: latestAnalysis.breathlessness_score, color: "text-warning" },
              { label: "Pitch (Hz)", value: latestAnalysis.pitch_mean, color: "text-info" },
              { label: "Pitch Var.", value: latestAnalysis.pitch_variation, color: "text-accent" },
              { label: "Speech Rate", value: latestAnalysis.speech_rate, color: "text-success" },
              { label: "Pause Score", value: latestAnalysis.pause_pattern_score, color: "text-destructive" },
            ].map((m) => (
              <div key={m.label} className="text-center p-4 rounded-lg bg-secondary/50">
                <p className={`text-2xl font-display font-bold ${m.color}`}>{Number(m.value).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{m.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default DashboardPage;
