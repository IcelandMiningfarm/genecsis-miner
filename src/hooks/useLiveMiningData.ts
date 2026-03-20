import { useState, useEffect, useCallback, useRef } from "react";

interface MiningStats {
  btcBalance: number;
  usdValue: number;
  miningPower: number;
  dailyEarnings: number;
  btcChange: string;
  usdChange: string;
  powerStatus: string;
  earningsChange: string;
}

interface ActivityItem {
  type: string;
  amount: string;
  time: string;
  iconType: "reward" | "deposit" | "upgrade" | "withdrawal";
}

interface ChartPoint {
  day: string;
  earnings: number;
  hashrate: number;
}

const randomDelta = (base: number, pct: number) =>
  base * (1 + (Math.random() - 0.5) * 2 * pct);

export const useLiveMiningData = () => {
  const [stats, setStats] = useState<MiningStats>({
    btcBalance: 0.04521,
    usdValue: 2847.32,
    miningPower: 95.4,
    dailyEarnings: 0.00152,
    btcChange: "+2.4%",
    usdChange: "+5.1%",
    powerStatus: "Active",
    earningsChange: "+0.8%",
  });

  const [activity, setActivity] = useState<ActivityItem[]>([
    { type: "Mining Reward", amount: "+0.00012 BTC", time: "Just now", iconType: "reward" },
    { type: "Deposit", amount: "+0.05 BTC", time: "1 hour ago", iconType: "deposit" },
    { type: "Plan Upgrade", amount: "-$500", time: "3 hours ago", iconType: "upgrade" },
    { type: "Mining Reward", amount: "+0.00011 BTC", time: "5 hours ago", iconType: "reward" },
    { type: "Withdrawal", amount: "-0.02 BTC", time: "1 day ago", iconType: "withdrawal" },
  ]);

  const [chartData, setChartData] = useState<ChartPoint[]>(() => {
    const data: ChartPoint[] = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        day: `Day ${i + 1}`,
        earnings: +(Math.random() * 0.005 + 0.002).toFixed(5),
        hashrate: +(Math.random() * 20 + 80).toFixed(1),
      });
    }
    return data;
  });

  const [isConnected, setIsConnected] = useState(false);
  const tickRef = useRef(0);

  // Simulate WebSocket connection
  useEffect(() => {
    const connectDelay = setTimeout(() => setIsConnected(true), 800);
    return () => clearTimeout(connectDelay);
  }, []);

  // Live stat updates every 3s
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;

      setStats((prev) => {
        const reward = +(Math.random() * 0.00005 + 0.00005).toFixed(6);
        const newBtc = +(prev.btcBalance + reward).toFixed(6);
        const btcPrice = randomDelta(63000, 0.005);
        const newUsd = +(newBtc * btcPrice).toFixed(2);
        const newPower = +randomDelta(prev.miningPower, 0.02).toFixed(1);
        const newEarnings = +randomDelta(prev.dailyEarnings, 0.05).toFixed(6);

        const btcPct = (((newBtc - 0.04521) / 0.04521) * 100).toFixed(1);
        const usdPct = (((newUsd - 2847.32) / 2847.32) * 100).toFixed(1);
        const earnPct = (((newEarnings - 0.00152) / 0.00152) * 100).toFixed(1);

        return {
          btcBalance: newBtc,
          usdValue: newUsd,
          miningPower: newPower,
          dailyEarnings: newEarnings,
          btcChange: `${+btcPct >= 0 ? "+" : ""}${btcPct}%`,
          usdChange: `${+usdPct >= 0 ? "+" : ""}${usdPct}%`,
          powerStatus: "Active",
          earningsChange: `${+earnPct >= 0 ? "+" : ""}${earnPct}%`,
        };
      });

      // Add new activity every ~9s
      if (tick % 3 === 0) {
        const reward = +(Math.random() * 0.0002 + 0.00008).toFixed(5);
        setActivity((prev) => [
          { type: "Mining Reward", amount: `+${reward} BTC`, time: "Just now", iconType: "reward" as const },
          ...prev.slice(0, 4).map((item) => ({
            ...item,
            time: ageTime(item.time),
          })),
        ]);
      }

      // Append chart point every ~15s
      if (tick % 5 === 0) {
        setChartData((prev) => {
          const next = [...prev.slice(1)];
          next.push({
            day: `Day ${30 + Math.floor(tick / 5)}`,
            earnings: +(Math.random() * 0.005 + 0.002).toFixed(5),
            hashrate: +(Math.random() * 20 + 80).toFixed(1),
          });
          return next;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return { stats, activity, chartData, isConnected };
};

function ageTime(t: string): string {
  if (t === "Just now") return "3 sec ago";
  if (t.includes("sec")) {
    const n = parseInt(t) || 3;
    return n >= 50 ? "1 min ago" : `${n + 10} sec ago`;
  }
  if (t.includes("min")) {
    const n = parseInt(t) || 1;
    return n >= 55 ? "1 hour ago" : `${n + 2} min ago`;
  }
  return t;
}
