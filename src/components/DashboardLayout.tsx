import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Pickaxe, ArrowDownToLine, ArrowUpFromLine,
  Settings, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Mining Plans", icon: Pickaxe, path: "/plans" },
  { label: "Deposit", icon: ArrowDownToLine, path: "/deposit" },
  { label: "Withdraw", icon: ArrowUpFromLine, path: "/withdraw" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">
              <span className="text-accent">CRYPTO</span>
              <span className="text-foreground">MINE</span>
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 sticky top-0 bg-background/80 backdrop-blur-lg z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3 text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </header>

        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
