import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Mic, BarChart3, Clock, User, Bell, LogOut, Pill, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Activity, label: "Dashboard", path: "/dashboard" },
  { icon: Mic, label: "Voice Diary", path: "/record" },
  { icon: Pill, label: "Medications", path: "/medications" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: User, label: "Profile", path: "/profile" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <>
      <div className="p-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gradient tracking-wider">VOXMED</h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">Voice Biomarker Tracker</p>
        </div>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-lg glass-strong"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-72 glass-strong flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebar}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 glass-strong flex-col z-50">
        {sidebar}
      </aside>
    </>
  );
};

export default AppSidebar;
