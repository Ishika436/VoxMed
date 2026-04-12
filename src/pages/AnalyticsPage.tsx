import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { format } from "date-fns";

const METRICS = [
  { key: "tremor_score", label: "Tremor", color: "#00F0FF" },
  { key: "breathlessness_score", label: "Breathlessness", color: "#C040FF" },
  { key: "pitch_variation", label: "Pitch Var.", color: "#60A5FA" },
  { key: "speech_rate", label: "Speech Rate", color: "#34D399" },
  { key: "pause_pattern_score", label: "Pause Score", color: "#F59E0B" },
  { key: "overall_health_score", label: "Health Score", color: "#10B981" },
];

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("biomarker_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("analyzed_at", { ascending: true })
      .then(({ data }) => setAnalyses(data || []));
  }, [user]);

  const chartData = analyses.map((a) => ({
    date: format(new Date(a.analyzed_at), "MMM dd"),
    ...Object.fromEntries(METRICS.map((m) => [m.key, Number(a[m.key as keyof typeof a])])),
  }));

  const latest = analyses[analyses.length - 1];
  const radarData = latest
    ? METRICS.filter((m) => m.key !== "overall_health_score").map((m) => ({
        subject: m.label,
        value: Number(latest[m.key as keyof typeof latest]),
      }))
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your vocal biomarker trends</p>
      </div>

      {analyses.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-muted-foreground">No analysis data yet. Record your first voice sample!</p>
        </GlassCard>
      ) : (
        <>
          {/* Trend lines */}
          <GlassCard>
            <h2 className="font-display text-lg font-semibold mb-4">Biomarker Trends</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
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
                {METRICS.map((m) => (
                  <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} name={m.label} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <h2 className="font-display text-lg font-semibold mb-4">Latest Biomarker Profile</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(215, 20%, 18%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="#00F0FF" fill="#00F0FF" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard>
              <h2 className="font-display text-lg font-semibold mb-4">Statistics Summary</h2>
              <div className="space-y-4">
                {METRICS.map((m) => {
                  const values = analyses.map((a) => Number(a[m.key as keyof typeof a]));
                  const avg = (values.reduce((s, v) => s + v, 0) / values.length).toFixed(1);
                  const min = Math.min(...values).toFixed(0);
                  const max = Math.max(...values).toFixed(0);
                  return (
                    <div key={m.key} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="text-sm flex-1">{m.label}</span>
                      <span className="text-xs font-mono text-muted-foreground">avg: {avg}</span>
                      <span className="text-xs font-mono text-muted-foreground">min: {min}</span>
                      <span className="text-xs font-mono text-muted-foreground">max: {max}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
