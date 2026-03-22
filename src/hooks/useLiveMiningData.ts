import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MiningStats {
  btcBalance: number;
  usdValue: number;
  miningPower: number;
  dailyEarnings: number;
  activePlans: number;
}

interface ChartPoint {
  day: string;
  earnings: number;
  hashrate: number;
}

const fetchBtcPrice = async (): Promise<{ price: number; change24h: number } | null> => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      { headers: { "x-cg-demo-api-key": "CG-9kLivg9HmUeX7VwDSgehcpLj" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      price: data.bitcoin?.usd ?? 0,
      change24h: data.bitcoin?.usd_24h_change ?? 0,
    };
  } catch {
    return null;
  }
};

export const useLiveMiningData = () => {
  const { user } = useAuth();
  const btcPriceRef = useRef(63000);

  const [stats, setStats] = useState<MiningStats>({
    btcBalance: 0,
    usdValue: 0,
    miningPower: 0,
    dailyEarnings: 0,
    activePlans: 0,
  });

  const [activePurchases, setActivePurchases] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [btcPrice, setBtcPrice] = useState({ price: 0, change24h: 0 });
  const [hasMining, setHasMining] = useState(false);

  // Fetch user data from DB
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Fetch balance
      const { data: balance } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Fetch active purchases
      const { data: purchases } = await supabase
        .from("user_purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      // Fetch deposits
      const { data: deps } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch withdrawals
      const { data: withs } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const btcBal = balance?.btc_balance ?? 0;
      const activeP = purchases ?? [];
      const totalDailyEarning = activeP.reduce((sum, p) => sum + (p.daily_earning || 0), 0);
      const totalMiningPower = activeP.length * 10; // 10 TH/s per active plan as base

      setActivePurchases(activeP);
      setDeposits(deps ?? []);
      setWithdrawals(withs ?? []);
      setHasMining(activeP.length > 0);

      setStats({
        btcBalance: btcBal,
        usdValue: btcBal * btcPriceRef.current,
        miningPower: totalMiningPower,
        dailyEarnings: totalDailyEarning,
        activePlans: activeP.length,
      });

      // Generate chart data based on purchases
      if (activeP.length > 0) {
        const data: ChartPoint[] = [];
        for (let i = 0; i < 30; i++) {
          data.push({
            day: `Day ${i + 1}`,
            earnings: +(totalDailyEarning * (0.8 + Math.random() * 0.4)).toFixed(6),
            hashrate: +(totalMiningPower * (0.9 + Math.random() * 0.2)).toFixed(1),
          });
        }
        setChartData(data);
      }
    };

    loadData();
  }, [user]);

  // Fetch real BTC price
  useEffect(() => {
    const load = async () => {
      const data = await fetchBtcPrice();
      if (data) {
        btcPriceRef.current = data.price;
        setBtcPrice(data);
        setStats(prev => ({ ...prev, usdValue: prev.btcBalance * data.price }));
      }
      setIsConnected(true);
    };
    load();

    const interval = setInterval(async () => {
      const data = await fetchBtcPrice();
      if (data) {
        btcPriceRef.current = data.price;
        setBtcPrice(data);
        setStats(prev => ({ ...prev, usdValue: prev.btcBalance * data.price }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { stats, activePurchases, deposits, withdrawals, chartData, isConnected, btcPrice, hasMining };
};
