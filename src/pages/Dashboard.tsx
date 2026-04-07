import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bitcoin, DollarSign, TrendingUp, Zap, ArrowUpRight, ArrowDownRight,
  BarChart3, ShieldAlert, Pickaxe, Cpu, Thermometer, Fan
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from "recharts";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { LiveIndicator } from "@/components/LiveIndicator";
import { useLiveMiningData } from "@/hooks/useLiveMiningData";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Animated counter component
const AnimatedValue = ({ value, prefix = "", suffix = "", decimals = 2 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) => (
  <motion.span
    key={value.toFixed(decimals)}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {prefix}{value.toFixed(decimals)}{suffix}
  </motion.span>
);

// Mining pulse ring animation
const MiningPulse = () => (
  <div className="relative">
    <motion.div
      className="absolute inset-0 rounded-full bg-primary/20"
      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute inset-0 rounded-full bg-primary/10"
      animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
    />
    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <Pickaxe className="h-4 w-4 text-primary" />
      </motion.div>
    </div>
  </div>
);

const MiningSimulator = ({ activePlans, miningPower }: { activePlans: number; miningPower: number }) => {
  const [hashProgress, setHashProgress] = useState(0);
  const [blocksFound, setBlocksFound] = useState(0);
  const [temp, setTemp] = useState(62);
  const [fanSpeed, setFanSpeed] = useState(74);

  useEffect(() => {
    if (activePlans === 0) return;
    const interval = setInterval(() => {
      setHashProgress((prev) => {
        if (prev >= 100) {
          setBlocksFound((b) => b + 1);
          return 0;
        }
        return prev + (0.5 + Math.random() * 2);
      });
      setTemp(60 + Math.random() * 8);
      setFanSpeed(70 + Math.random() * 10);
    }, 200);
    return () => clearInterval(interval);
  }, [activePlans]);

  if (activePlans === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h3 className="text-foreground font-semibold">Mining Simulator</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">Blocks: {blocksFound}</span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Hash Progress</span>
            <span className="text-xs font-mono text-primary">{Math.min(hashProgress, 100).toFixed(1)}%</span>
          </div>
          <div className="relative">
            <Progress value={Math.min(hashProgress, 100)} className="h-3 bg-secondary" />
            <motion.div
              className="absolute inset-0 rounded-full opacity-30"
              style={{ background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)", backgroundSize: "200% 100%" }}
              animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Hashrate</p>
            <p className="text-sm font-mono font-semibold text-foreground">{miningPower.toFixed(1)} TH/s</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <Thermometer className="h-4 w-4 text-accent mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">GPU Temp</p>
            <p className="text-sm font-mono font-semibold text-foreground">{temp.toFixed(0)}°C</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <Fan className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Fan Speed</p>
            <p className="text-sm font-mono font-semibold text-foreground">{fanSpeed.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, activePurchases, chartData, isConnected, btcPrice, hasMining } = useLiveMiningData();
  const navigate = useNavigate();
  const pricePositive = btcPrice.change24h >= 0;

  const statCards = [
    {
      label: "BTC Balance", value: stats.btcBalance, prefix: "₿ ", decimals: 6,
      icon: Bitcoin, glowClass: "glow-accent", showPulse: false,
    },
    {
      label: "USD Value", value: stats.usdValue, prefix: "$", decimals: 2,
      icon: DollarSign, glowClass: "", showPulse: false,
    },
    {
      label: "Mining Power", value: stats.miningPower, suffix: " TH/s", decimals: 1,
      icon: Zap, glowClass: "glow-primary", showPulse: hasMining,
    },
    {
      label: "Daily Earnings", value: stats.dailyEarnings, prefix: "₿ ", decimals: 6,
      icon: TrendingUp, glowClass: "",
      subValue: btcPrice.price > 0 ? `≈ $${(stats.dailyEarnings * btcPrice.price).toFixed(2)}` : undefined,
      showPulse: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Welcome back, {user?.email?.split("@")[0] ?? "Miner"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card px-4 py-2 flex items-center gap-3"
            >
              <Bitcoin className="h-5 w-5 text-accent" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">BTC/USD</span>
                <span className="text-foreground font-bold font-mono tabular-nums text-sm">
                  ${btcPrice.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`flex items-center text-xs font-mono ${pricePositive ? 'text-primary' : 'text-destructive'}`}>
                {pricePositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(btcPrice.change24h).toFixed(2)}%
              </div>
            </motion.div>
            <LiveIndicator connected={isConnected} />
          </div>
        </div>

        {/* Mining Status Banner */}
        {hasMining && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 border-primary/30 bg-primary/5 flex items-center gap-4"
          >
            <MiningPulse />
            <div className="flex-1">
              <p className="text-foreground font-semibold text-sm flex items-center gap-2">
                Mining Active
                <motion.span
                  className="inline-block w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </p>
              <p className="text-muted-foreground text-xs">
                {stats.activePlans} contract{stats.activePlans > 1 ? "s" : ""} running • {stats.miningPower} TH/s total hashrate
              </p>
            </div>
          </motion.div>
        )}

        {/* No Mining Warning */}
        {!hasMining && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-accent/30 bg-accent/5 text-center"
          >
            <ShieldAlert className="h-10 w-10 text-accent mx-auto mb-3" />
            <h3 className="text-foreground font-semibold text-lg mb-1">No Active Mining Contracts</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Purchase a mining plan to start earning BTC or USDT daily.
            </p>
            <Button onClick={() => navigate("/plans")} className="gradient-primary text-primary-foreground glow-primary">
              Browse Mining Plans
            </Button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 hover:border-primary/30 transition-all ${stat.glowClass}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">{stat.label}</span>
                {stat.showPulse ? (
                  <MiningPulse />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-foreground font-mono tabular-nums">
                <AnimatedValue value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
              </div>
              {(stat as any).subValue && (
                <p className="text-xs text-muted-foreground mt-1 font-mono">{(stat as any).subValue}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Active Plans */}
        {activePurchases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-foreground font-semibold mb-4">Active Mining Contracts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">Plan</th>
                    <th className="text-left py-3 font-medium">Type</th>
                    <th className="text-left py-3 font-medium">Daily Earning</th>
                    <th className="text-left py-3 font-medium">Expires</th>
                    <th className="text-left py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activePurchases.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground font-medium">{p.plan_name}</td>
                      <td className="py-3 text-foreground">{p.plan_type}</td>
                      <td className="py-3 font-mono text-primary">{p.daily_earning} {p.plan_type}</td>
                      <td className="py-3 text-muted-foreground">{new Date(p.expires_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary gap-1">
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Charts */}
        {hasMining && chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground font-semibold">Earnings Overview</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">Last 30 days</p>
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160, 84%, 44%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(160, 84%, 44%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
                  <Area type="monotone" dataKey="earnings" stroke="hsl(160, 84%, 44%)" fill="url(#earningsGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-foreground font-semibold">Hashrate Performance</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">Mining power over time</p>
                </div>
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="day" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
                  <Line type="monotone" dataKey="hashrate" stroke="hsl(32, 95%, 55%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
