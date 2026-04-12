import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Activity, Mic, Brain } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back!");
      } else {
        await signUp(email, password, fullName);
        toast.success("Account created! Check your email to verify.");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative z-10 text-center">
          <h1 className="font-display text-5xl font-bold text-gradient tracking-wider mb-4">VOXMED</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            AI-Powered Voice Biomarker Disease Tracking
          </p>
          <div className="flex gap-8 mt-12 justify-center">
            {[
              { icon: Mic, label: "Voice Diary" },
              { icon: Brain, label: "AI Analysis" },
              { icon: Activity, label: "Health Tracking" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="p-4 rounded-xl bg-primary/10 glow-primary">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-gradient tracking-wider">VOXMED</h1>
          </div>

          <div className="glass-strong rounded-2xl p-8">
            <h2 className="text-xl font-display font-semibold mb-1">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {isLogin ? "Sign in to your voice diary" : "Start tracking your vocal biomarkers"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg gradient-primary font-display font-semibold text-primary-foreground text-sm tracking-wider hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
