import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Brain, Activity, Shield, TrendingUp, Bell, ChevronRight, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Mic, title: "Voice Diary", desc: "Record a 15-second daily voice sample — quick, non-invasive, and effortless." },
  { icon: Brain, title: "AI Biomarker Analysis", desc: "Extracts tremors, breathlessness, pitch, speech rate, and pause patterns in real time." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "Visualize health trends over days, weeks, and months with interactive charts." },
  { icon: Bell, title: "Smart Alerts", desc: "Get notified instantly when anomalies or deterioration patterns are detected." },
  { icon: Shield, title: "Secure & Private", desc: "Your health data is encrypted and accessible only to you — zero third-party sharing." },
  { icon: Zap, title: "Cost-Free AI", desc: "Built entirely with open-source models — no paid APIs, fully scalable." },
];

const conditions = ["Asthma", "Parkinson's", "Depression", "Cardiovascular", "Post-Stroke", "Neurological"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const LandingPage = () => (
  <div className="min-h-screen bg-background overflow-hidden">
    {/* Navbar */}
    <nav className="fixed top-0 w-full z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gradient tracking-wider">VOXMED</h1>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition">
            Sign In
          </Link>
          <Link
            to="/auth"
            className="px-5 py-2 rounded-lg gradient-primary font-display text-xs font-semibold text-primary-foreground tracking-wider hover:opacity-90 transition"
          >
            GET STARTED
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <p className="font-mono text-xs text-primary tracking-widest uppercase mb-4">AI-Powered Health Monitoring</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your Voice Is a <span className="text-gradient">Window</span> Into Your Health
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mb-8 leading-relaxed">
            Speak for 15 seconds. Our AI analyzes vocal biomarkers — tremors, breathlessness, pitch shifts — to track disease progression and medication effectiveness between clinical visits.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary font-display text-sm font-semibold text-primary-foreground tracking-wider hover:opacity-90 transition animate-pulse-glow"
            >
              Start Your Voice Diary <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-border font-display text-sm font-semibold tracking-wider hover:bg-secondary transition"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:block"
        >
          {/* Floating biomarker preview card */}
          <div className="glass-strong rounded-2xl p-8 relative">
            <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-display font-semibold">LIVE</div>
            <p className="font-mono text-xs text-muted-foreground mb-4">BIOMARKER SCAN RESULT</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Tremor", value: 12, color: "text-primary" },
                { label: "Breath", value: 8, color: "text-success" },
                { label: "Pitch", value: 142, color: "text-accent" },
              ].map((m) => (
                <div key={m.label} className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className={`text-xl font-display font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-mono text-success">Overall Health: 87% — Normal</span>
            </div>
            {/* Fake waveform bars */}
            <div className="flex items-end gap-[3px] h-16 mt-6">
              {Array.from({ length: 60 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full bg-primary/60"
                  initial={{ height: 4 }}
                  animate={{ height: [4, Math.random() * 50 + 10, 4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Conditions */}
    <section className="py-16 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-6">Designed for patients with</p>
        <div className="flex flex-wrap justify-center gap-3">
          {conditions.map((c) => (
            <span key={c} className="px-5 py-2 rounded-full border border-border text-sm text-muted-foreground font-medium">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary tracking-widest uppercase mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Everything You Need to Track Health</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="glass rounded-xl p-6 hover:glow-primary transition-all duration-300 group"
            >
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-24 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-primary tracking-widest uppercase mb-3">How It Works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Three Simple Steps</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Speak", desc: "Record a 15-second voice sample into VoxMed each day." },
            { step: "02", title: "Analyze", desc: "AI extracts vocal biomarkers — tremors, breathlessness, pitch, pauses." },
            { step: "03", title: "Track", desc: "Monitor trends, receive alerts, and share insights with your doctor." },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <div className="font-display text-5xl font-bold text-primary/20 mb-4">{s.step}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-2xl p-12"
        >
          <h2 className="font-display text-3xl font-bold mb-4">Start Monitoring Your Health Today</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join VoxMed and take control of your health between clinical visits. It takes just 15 seconds a day.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl gradient-primary font-display text-sm font-semibold text-primary-foreground tracking-wider hover:opacity-90 transition animate-pulse-glow"
          >
            Create Free Account <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border/30 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display text-sm font-bold text-gradient tracking-wider">VOXMED</p>
        <p className="text-xs text-muted-foreground">© 2026 VoxMed. AI-Powered Voice Biomarker Tracking.</p>
      </div>
    </footer>
  </div>
);

export default LandingPage;
