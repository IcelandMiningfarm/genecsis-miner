import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Bitcoin, DollarSign, ShieldCheck, Clock, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import antminerImg from "@/assets/antminer-s21.png";

// ── BTC Plans ──────────────────────────────────────────────
const btcPlans = [
  {
    name: "Free BTC for 1 day", price: 0, duration: "1 Day", durationDays: 1, dailyEarning: 0.000001, details: [
      { label: "Contract duration", value: "1 days" },
      { label: "Contract price", value: "$ 0" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily Mining", value: "0.000001 BTC ≈ 0.1 USD" },
      { label: "Receive once a day", value: "" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "NEWBIE", price: 15, duration: "1 Day", durationDays: 1, dailyEarning: 0.0006, details: [
      { label: "Contract duration", value: "1 days" },
      { label: "Contract price", value: "$ 15" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily Mining", value: "0.0006 BTC ≈ $ 40" },
      { label: "Limit one purchase", value: "" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "BEGINNER", price: 215, duration: "1 Day", durationDays: 1, dailyEarning: 0.00331, details: [
      { label: "Contract duration", value: "1 days" },
      { label: "Contract price", value: "$ 215" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily mining", value: "0.00331 BTC (≈ $ 231.77)" },
      { label: "Limit one purchase", value: "" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "ADVANCED 3-day plan", price: 2999, duration: "3 Day", durationDays: 3, dailyEarning: 0.0166, details: [
      { label: "Contract duration", value: "3 days" },
      { label: "Contract price", value: "$ 2,999" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily mining", value: "0.0166 BTC (≈ $ 1,740)" },
      { label: "Total earnings", value: "0.0498 BTC ≈ $ 5,220" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "BASIC", price: 360, duration: "365 Day", durationDays: 365, dailyEarning: 0.00063, details: [
      { label: "Contract duration", value: "365 days" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily Mining", value: "0.00063 BTC (≈ $ 44.11)" },
      { label: "Monthly mining", value: "0.0189 BTC ≈ $ 1,323.30" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "ECONOMY", price: 770, duration: "365 Day", durationDays: 365, dailyEarning: 0.00162, details: [
      { label: "Contract duration", value: "365 days" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily Mining", value: "0.00162 BTC (≈ $ 113.43)" },
      { label: "Monthly mining", value: "0.0486 BTC ≈ $ 3,402.90" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "STANDARD", price: 2350, duration: "365 Day", durationDays: 365, dailyEarning: 0.00591, details: [
      { label: "Contract duration", value: "365 days" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily Mining", value: "0.00591 BTC (≈ $ 413.82)" },
      { label: "Monthly mining", value: "0.1773 BTC ≈ $ 12,414.60" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "SENIOR", price: 6580, duration: "365 Day", durationDays: 365, dailyEarning: 0.02603, details: [
      { label: "Contract duration", value: "365 days" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily Mining", value: "0.02603 BTC (≈ $ 1,822.64)" },
      { label: "Monthly mining", value: "0.7809 BTC ≈ $ 54,679.20" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "ADVANCED", price: 13860, duration: "365 Day", durationDays: 365, dailyEarning: 0.05529, details: [
      { label: "Contract duration", value: "365 days" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily Mining", value: "0.05529 BTC (≈ $ 3,871.44)" },
      { label: "Monthly mining", value: "1.6587 BTC ≈ $ 116,143.20" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "LUXURIOUS", price: 32000, duration: "365 Day", durationDays: 365, dailyEarning: 0.14815, details: [
      { label: "Contract duration", value: "365 days" },
      { label: "Hardware", value: "Antminer S21" },
      { label: "Daily Mining", value: "0.14815 BTC (≈ $ 10,373.56)" },
      { label: "Monthly mining", value: "4.4445 BTC ≈ $ 311,206.80" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
];
// ── USDT Plans ─────────────────────────────────────────────
const usdtPlans = [
  {
    name: "GPT Beginner Strategy - Zero Risk", price: 50, duration: "1 Day", durationDays: 1, dailyEarning: 55, details: [
      { label: "Fund Operation", value: "Intelligent Quantitative Trading" },
      { label: "Contract duration", value: "1 day" },
      { label: "Daily earnings", value: "55 USDT" },
      { label: "Limit one purchase", value: "" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "GPT Robust Strategy - Zero Risk", price: 200, duration: "1 Day", durationDays: 1, dailyEarning: 208, details: [
      { label: "Fund Operation", value: "Intelligent Quantitative Trading" },
      { label: "Contract duration", value: "1 day" },
      { label: "Daily earnings", value: "208 USDT" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "STANDARD Strategy - Zero Risk", price: 3000, duration: "3 Day", durationDays: 3, dailyEarning: 1000, details: [
      { label: "Fund Operation", value: "Intelligent Quantitative Trading" },
      { label: "Contract duration", value: "3 day" },
      { label: "Daily earnings", value: "1,000 USDT" },
      { label: "Total earnings", value: "6,000 USDT" },
      { label: "Limit one purchase", value: "" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "GPT Advanced Strategy - Zero Risk", price: 5000, duration: "1 Day", durationDays: 1, dailyEarning: 2500, details: [
      { label: "Fund Operation", value: "Intelligent Quantitative Trading" },
      { label: "Contract duration", value: "1 day" },
      { label: "Daily rate of return", value: "50%" },
      { label: "Total earnings", value: "7,500 USDT" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
  {
    name: "GPT Champion Strategy - Zero Risk", price: 10000, duration: "3 Day", durationDays: 3, dailyEarning: 2000, details: [
      { label: "Fund Operation", value: "Intelligent Quantitative Trading" },
      { label: "Contract duration", value: "3 day" },
      { label: "Daily rate of return", value: "20%" },
      { label: "Total earnings", value: "16,000 USDT" },
      { label: "Purchase Agreement", value: "View all", link: true },
      { label: "Financial Permit", value: "UK Government Permit" },
    ],
  },
];

// ── Live activity feed data ────────────────────────────────
const generateActivity = () => {
  const names = [
    "emi***lio", "880***334", "cal***b67", "ZGV***GVy", "luc***118",
    "bal***ial", "bla***123", "58p***ord", "D95***7", "Mhl***ebi",
    "str***kin", "201***612", "joj***yer", "Gol***ane", "rom***c52",
    "100***ler", "Taw***are", "puv***abu", "pat***ck1", "Lia***026",
    "coo***ath", "des***y69", "the***rs7", "dak***ota",
  ];
  const amounts = [
    "24.00000 USD", "150.00000 USD", "770.00000 USD", "10.00000 USD",
    "2,999.00000 USD", "30.00000 USD", "32,000.00000 USD", "2,000.00000 USD",
    "5.00000 USD", "60.00000 USD", "7,497.00000 USD", "1,000.00000 USD",
    "20.00000 USD", "50.00000 USD", "19,740.00000 USD", "100.00000 USD",
    "285.00000 USD", "5,000.00000 USD", "96,000.00000 USD",
  ];
  const times = ["1 minute ago", "5 mins ago", "7 mins ago", "11 mins ago", "15 mins ago", "21 mins ago", "27 mins ago", "33 mins ago", "1 h ago"];
  return Array.from({ length: 20 }, (_, i) => ({
    name: names[i % names.length],
    amount: amounts[i % amounts.length],
    time: times[i % times.length],
  }));
};

// ── Pool payouts ───────────────────────────────────────────
const poolPayouts = [
  { date: "20 hours ago", txId: "946bca6247c4***e8498bf199d7", btc: "6.91701989" },
  { date: "20 hours ago", txId: "offchain***", btc: "39.8202015" },
  { date: "20 hours ago", txId: "refund***", btc: "92.44661508" },
  { date: "20 hours ago", txId: "464041c921a6***3fdd1a6a72c6", btc: "0.28045426" },
  { date: "1 day ago", txId: "0c7f706cfc6a***cc84cee39db9", btc: "6.79385345" },
  { date: "1 day ago", txId: "c1552fb27827***8918d79f8ddb", btc: "0.28266234" },
  { date: "2 days ago", txId: "ce884d617a0b***952f9c720976", btc: "7.06734912" },
  { date: "2 days ago", txId: "81af7fde960d***ee7f138801de", btc: "0.28214721" },
  { date: "3 days ago", txId: "6fffb28a2fd8***ab68d04551ce", btc: "6.64365666" },
  { date: "3 days ago", txId: "a09f9fd474da***75899309e563", btc: "0.30848167" },
];

// ── Scrolling ticker ───────────────────────────────────────
const ActivityTicker = () => {
  const items = useRef(generateActivity());
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setOffset((p) => p + 1), 4000);
    return () => clearInterval(iv);
  }, []);

  const visible = items.current.slice(offset % items.current.length, (offset % items.current.length) + 5);

  return (
    <div className="space-y-2 overflow-hidden max-h-[280px]">
      <AnimatePresence mode="popLayout">
        {visible.map((item, i) => (
          <motion.div
            key={`${item.name}-${offset}-${i}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm"
          >
            <span className="text-foreground font-medium">{item.name}</span>
            <span className="text-accent font-mono">{item.amount}</span>
            <span className="text-muted-foreground text-xs">{item.time}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ── Plan Card ──────────────────────────────────────────────
interface PlanCardProps {
  plan: { name: string; price: number; duration: string; durationDays: number; dailyEarning: number; details: { label: string; value: string; link?: boolean }[] };
  type: "BTC" | "USDT";
  index: number;
  onBuy: (plan: PlanCardProps["plan"], type: "BTC" | "USDT") => void;
}

const PlanCard = ({ plan, type, index, onBuy }: PlanCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="glass-card overflow-hidden flex flex-col"
  >
    {/* Header */}
    <div className="relative p-5 pb-3 text-center">
      <Badge className={`absolute top-3 right-3 ${type === "BTC" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
        {type}
      </Badge>
      {type === "BTC" ? (
        <img src={antminerImg} alt="Antminer S21" className="h-16 mx-auto mb-3 object-contain" />
      ) : (
        <div className="h-16 flex items-center justify-center mb-3 text-4xl">💰</div>
      )}
      <h3 className="text-sm font-bold text-foreground leading-tight">{plan.name}</h3>
      <p className="text-xl font-bold text-accent mt-1">
        ${plan.price.toLocaleString()} / {plan.duration}
      </p>
    </div>

    {/* Details */}
    <div className="flex-1 px-4 pb-4 space-y-0">
      {plan.details.map((d, i) => (
        <div key={i} className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0 text-xs">
          <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
          <span className="text-muted-foreground">{d.label}</span>
          {d.value && (
            <span className={`ml-auto text-right ${d.link ? "text-primary cursor-pointer hover:underline" : "text-foreground"}`}>
              {d.value}
            </span>
          )}
        </div>
      ))}
    </div>

    {/* Buy Button */}
    <div className="p-4 pt-0">
      <Button
        onClick={() => onBuy(plan, type)}
        className="w-full gradient-primary text-primary-foreground glow-primary"
      >
        Buy Now
      </Button>
    </div>
  </motion.div>
);

// ── Main Page ──────────────────────────────────────────────
const MiningPlans = () => {
  const navigate = useNavigate();
  const [btcPrice, setBtcPrice] = useState(71076.52);
  const [selectedPlan, setSelectedPlan] = useState<{ plan: PlanCardProps["plan"]; type: "BTC" | "USDT" } | null>(null);

  const handleBuy = (plan: PlanCardProps["plan"], type: "BTC" | "USDT") => {
    setSelectedPlan({ plan, type });
  };

  const handleConfirmPurchase = () => {
    const plan = selectedPlan;
    setSelectedPlan(null);
    navigate("/deposit", {
      state: {
        planName: plan?.plan.name,
        planPrice: plan?.plan.price,
        planType: plan?.type,
        planDuration: plan?.plan.duration,
        dailyEarning: plan?.plan.dailyEarning,
        durationDays: plan?.plan.durationDays,
      },
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
          { headers: { "x-cg-demo-api-key": "CG-9kLivg9HmUeX7VwDSgehcpLj" } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.bitcoin?.usd) setBtcPrice(data.bitcoin.usd);
        }
      } catch { /* fallback to default */ }
    };
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-accent/30 bg-accent/5 p-4"
        >
          <p className="text-accent font-semibold text-sm">
            Your selected mining contract is activated automatically once your payment is confirmed.
          </p>
        </motion.div>

        {/* Instructions */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="text-foreground">
            Mining income is released once a day. You can withdraw the output at any time (without waiting for the end of the contract). There is no limit to the number of withdrawals.
          </p>
          <p className="font-medium text-foreground">You can have the fastest bitcoin miner in 5 minutes:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Choose one of the below miners</li>
            <li>Click on "Buy Now" button and pay the miner price</li>
            <li>Your miner is launched and adds bitcoin to your balance every second (until 1 year)</li>
            <li>Your bitcoin increases every minute and you can withdraw it or buy a new bigger miner</li>
          </ol>
          <p className="text-xs border-t border-border pt-3 mt-3">
            <span className="font-semibold text-foreground">USDT:</span> The profit of USDT Plans comes from intelligent quantitative trading strategies. Daily earnings may fluctuate based on Binance trading depth. The contract period is only one day, so you can withdraw all your funds the next day.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="btc" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="btc" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground gap-1.5">
                <Bitcoin className="h-4 w-4" /> BTC
              </TabsTrigger>
              <TabsTrigger value="usdt" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
                <DollarSign className="h-4 w-4" /> USDT
              </TabsTrigger>
            </TabsList>
            <span className="text-sm text-muted-foreground font-mono">
              BTC ≈ <span className="text-foreground font-semibold">${btcPrice.toLocaleString()}</span>
            </span>
          </div>

          <TabsContent value="btc">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {btcPlans.map((plan, i) => (
                <PlanCard key={plan.name} plan={plan} type="BTC" index={i} onBuy={handleBuy} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usdt">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {usdtPlans.map((plan, i) => (
                <PlanCard key={plan.name} plan={plan} type="USDT" index={i} onBuy={handleBuy} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Live Activity + Pool Payouts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Live Purchases
            </h3>
            <ActivityTicker />
          </div>

          {/* Pool Payouts */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">BTC Pool Payouts</h3>
            <p className="text-xs text-muted-foreground mb-4">
              <span className="text-accent font-mono font-bold">7.8729312 BTC</span> paid out in the last 24 hours
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Transaction ID</th>
                    <th className="text-right py-2 font-medium">Sum BTC</th>
                  </tr>
                </thead>
                <tbody>
                  {poolPayouts.map((p, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 text-muted-foreground whitespace-nowrap">{p.date}</td>
                      <td className="py-2 text-foreground font-mono truncate max-w-[180px]">{p.txId}</td>
                      <td className="py-2 text-right text-accent font-mono">{p.btc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg">Confirm Purchase</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review your mining contract details before proceeding to payment.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              {/* Plan summary */}
              <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-semibold text-foreground">{selectedPlan.plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-lg font-bold text-accent">
                    ${selectedPlan.plan.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm text-foreground">{selectedPlan.plan.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Currency</span>
                  <Badge className={selectedPlan.type === "BTC" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}>
                    {selectedPlan.type}
                  </Badge>
                </div>
              </div>

              {/* Key details */}
              <div className="space-y-2">
                {selectedPlan.plan.details.slice(0, 4).map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="text-muted-foreground">{d.label}</span>
                    {d.value && <span className="ml-auto text-foreground">{d.value}</span>}
                  </div>
                ))}
              </div>

              {/* Info badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure Payment
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Instant Activation
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1">
                  <Cpu className="h-3.5 w-3.5 text-primary" /> Antminer S21
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedPlan(null)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase} className="gradient-primary text-primary-foreground glow-primary">
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MiningPlans;
