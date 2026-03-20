import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, Bitcoin, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const depositHistory = [
  { id: "TX001", amount: "0.05 BTC", status: "Confirmed", date: "2026-03-18", confirmations: "6/6" },
  { id: "TX002", amount: "500 USDT", status: "Pending", date: "2026-03-19", confirmations: "2/6" },
  { id: "TX003", amount: "0.1 BTC", status: "Confirmed", date: "2026-03-15", confirmations: "6/6" },
];

const DepositPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "USDT">("BTC");

  useEffect(() => {
    const state = location.state as { planName?: string; planPrice?: number; planType?: string; planDuration?: string } | null;
    if (state?.planName) {
      setSelectedCrypto(state.planType === "USDT" ? "USDT" : "BTC");
      toast({
        title: `📋 ${state.planName} selected`,
        description: `Deposit $${state.planPrice?.toLocaleString()} in ${state.planType} to activate your ${state.planDuration} contract.`,
      });
      // Clear state so toast doesn't re-show on refresh
      window.history.replaceState({}, document.title);
    }
  }, []);

  const walletAddresses = {
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    USDT: "TN3kS7dVqH9KvW3P8ZxmQ5rFg2Yt1nKp7a",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddresses[selectedCrypto]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deposit</h1>
          <p className="text-muted-foreground text-sm mt-1">Fund your mining account</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Deposit Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="text-foreground font-semibold mb-4">Select Currency</h3>

            <div className="flex gap-3 mb-6">
              {(["BTC", "USDT"] as const).map((crypto) => (
                <button
                  key={crypto}
                  onClick={() => setSelectedCrypto(crypto)}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    selectedCrypto === crypto
                      ? "gradient-primary text-primary-foreground glow-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {crypto}
                </button>
              ))}
            </div>

            <label className="text-sm text-muted-foreground mb-2 block">Deposit Address</label>
            <div className="flex gap-2">
              <Input
                value={walletAddresses[selectedCrypto]}
                readOnly
                className="bg-secondary border-border font-mono text-xs"
              />
              <Button onClick={handleCopy} variant="outline" size="icon" className="border-border shrink-0">
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-xs text-accent font-medium">⚠️ Important</p>
              <p className="text-xs text-muted-foreground mt-1">
                Only send {selectedCrypto} to this address. Sending other assets may result in permanent loss.
              </p>
            </div>
          </motion.div>

          {/* Deposit Amount */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-foreground font-semibold mb-4">Quick Deposit</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Amount ({selectedCrypto})</label>
                <Input placeholder="0.00" className="bg-secondary border-border font-mono" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0.01, 0.05, 0.1].map((amt) => (
                  <button key={amt} className="py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors font-mono">
                    {amt} {selectedCrypto}
                  </button>
                ))}
              </div>
              <Button className="w-full gradient-primary text-primary-foreground glow-primary">
                Confirm Deposit
              </Button>
            </div>
          </motion.div>
        </div>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-foreground font-semibold mb-4">Deposit History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-3 font-medium">TX ID</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Confirmations</th>
                  <th className="text-left py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {depositHistory.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50">
                    <td className="py-3 font-mono text-foreground">{tx.id}</td>
                    <td className="py-3 font-mono text-foreground">{tx.amount}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        tx.status === "Confirmed" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                      }`}>
                        {tx.status === "Confirmed" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-muted-foreground">{tx.confirmations}</td>
                    <td className="py-3 text-muted-foreground">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DepositPage;
