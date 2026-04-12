import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/GlassCard";
import { toast } from "sonner";
import { User, Save } from "lucide-react";

const CONDITIONS = ["Asthma", "Cardiovascular", "Neurological", "Post-Stroke", "Parkinson's", "Depression", "Other"];

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
          setDob(data.date_of_birth || "");
          setConditions(data.conditions || []);
          setMedications((data.medications || []).join(", "));
        }
      });
  }, [user]);

  const toggleCondition = (c: string) => {
    setConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      date_of_birth: dob || null,
      conditions,
      medications: medications.split(",").map((m) => m.trim()).filter(Boolean),
    }).eq("user_id", user.id);

    if (error) toast.error("Failed to save");
    else toast.success("Profile updated!");
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your health information</p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{fullName || "Unnamed"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Health Conditions</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    conditions.includes(c)
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Medications (comma separated)</label>
            <input
              type="text"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g. Levodopa, Salbutamol"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary font-display text-sm font-semibold text-primary-foreground tracking-wider hover:opacity-90 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "SAVE PROFILE"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfilePage;
