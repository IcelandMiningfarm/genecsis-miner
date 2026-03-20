import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bitcoin, DollarSign, TrendingUp, Zap, ArrowUpRight, ArrowDownRight,
  Wallet, Activity, BarChart3
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { LiveIndicator } from "@/components/LiveIndicator";
import { useLiveMiningData } from "@/hooks/useLiveMiningData";

const AnimatedNumber = ({ value, prefix = "", suffix = "", decimals = 2 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (Math.abs(diff) < 1e-8) return;
    const steps = 20;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start + diff * (step / steps));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-mono tabular-nums">
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
};

const iconMap = {
  reward: Zap,
  deposit: ArrowDownRight,
  upgrade: ArrowUpRight,
  withdrawal: Wallet,
};

const Dashboard = () => {
  const { stats, activity, chartData, isConnected } = useLiveMiningData();

  const statCards = [
    {
      label: "BTC Balance", value: stats.btcBalance, prefix: "₿ ", decimals: 5,
      icon: Bitcoin, change: stats.btcChange, glowClass: "glow-accent",
    },
    {
      label: "USD Value", value: stats.usdValue, prefix: "$", decimals: 2,
      icon: DollarSign, change: stats.usdChange, glowClass: "",
    },
    {
      label: "Mining Power", value: stats.miningPower, suffix: " TH/s", decimals: 1,
      icon: Zap, change: stats.powerStatus, glowClass: "glow-primary",
    },
    {
      label: "Daily Earnings", value: stats.dailyEarnings, prefix: "₿ ", decimals: 5,
      icon: TrendingUp, change: stats.earningsChange, glowClass: "",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, Miner</p>
          </div>
          <LiveIndicator connected={isConnected} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const positive = stat.change.startsWith("+") || stat.change === "Active";
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-5 hover:border-primary/30 transition-all ${stat.glowClass}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground text-sm">{stat.label}</span>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground glow-text-primary">
                  <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
                </div>
                <div className="flex items-center mt-2 text-xs">
                  {positive ? (
                    <ArrowUpRight className="h-3 w-3 text-primary mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
                  )}
                  <motion.span
                    key={stat.change}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={positive ? "text-primary" : "text-destructive"}
                  >
                    {stat.change}
                  </motion.span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold">Earnings Overview</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Last 30 days • Live</p>
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
                <Area type="monotone" dataKey="earnings" stroke="hsl(160, 84%, 44%)" fill="url(#earningsGradient)" strokeWidth={2} animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">Recent Activity</h3>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activity.map((item, i) => {
                  const Icon = iconMap[item.iconType];
                  return (
                    <motion.div
                      key={`${item.type}-${item.amount}-${i}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                      <span className={`text-xs font-mono ${item.amount.startsWith('+') ? 'text-primary' : 'text-accent'}`}>
                        {item.amount}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Hashrate Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground font-semibold">Hashrate Performance</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Mining power over time • Live</p>
            </div>
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)" }} />
              <Line type="monotone" dataKey="hashrate" stroke="hsl(32, 95%, 55%)" strokeWidth={2} dot={false} animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
