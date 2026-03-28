import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Check, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";

const DepositPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "USDT" | "ETH" | "XRP" | "BNB">("BTC");
  const [amount, setAmount] = useState("");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const state = location.state as { planName?: string; planPrice?: number; planType?: string; planDuration?: string } | null;
    if (state?.planName) {
      setSelectedCrypto(state.planType === "USDT" ? "USDT" : state.planType === "ETH" ? "ETH" : state.planType === "XRP" ? "XRP" : state.planType === "BNB" ? "BNB" : "BTC");
      setAmount(String(state.planPrice ?? ""));
      toast({
        title: `📋 ${state.planName} selected`,
        description: `Deposit $${state.planPrice?.toLocaleString()} in ${state.planType} to activate your ${state.planDuration} contract.`,
      });
      window.history.replaceState({}, document.title);
    }
  }, []);

  // Load deposits
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDeposits(data ?? []);
    };
    load();
  }, [user]);

  const walletAddresses = {
    BTC: "bc1qgwcsk7ejyq3u5747xa9r49lyn3a3dpk7e2xx26",
    USDT: "TSThbFbqfViVxNSg9cnQ6taqSghH8p6kyc",
    ETH: "0x88fd1a2E86C723f522d2e47BB725b4633A12cf20",
    XRP: "rE5apkmMAn1WC5UEoVScT6kATnocbSqEzu",
    BNB: "0x88fd1a2E86C723f522d2e47BB725b4633A12cf20",
  };

  const networkLabels: Record<string, string> = {
    BTC: "Bitcoin",
    USDT: "TRC20 (Tron)",
    ETH: "Ethereum",
    XRP: "XRP Ledger",
    BNB: "BNB Smart Chain",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddresses[selectedCrypto]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("deposits").insert({
        user_id: user.id,
        amount: parseFloat(amount),
        currency: selectedCrypto,
        status: "pending",
      });
      if (error) throw error;
      toast({ title: "Deposit submitted", description: "Your deposit is pending confirmation." });
      setAmount("");
      // Reload deposits
      const { data } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDeposits(data ?? []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deposit</h1>
          <p className="text-muted-foreground text-sm mt-1">Fund your mining account</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="text-foreground font-semibold mb-4">Select Currency</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {(["BTC", "USDT", "ETH", "XRP", "BNB"] as const).map((crypto) => (
                <button
                  key={crypto}
                  onClick={() => setSelectedCrypto(crypto)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedCrypto === crypto
                      ? "gradient-primary text-primary-foreground glow-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {crypto}
                </button>
              ))}
            </div>

            <label className="text-sm text-muted-foreground mb-1 block">Network: <span className="text-foreground font-medium">{networkLabels[selectedCrypto]}</span></label>
            <label className="text-sm text-muted-foreground mb-2 block">Deposit Address</label>
            <div className="flex gap-2">
              <Input value={walletAddresses[selectedCrypto]} readOnly className="bg-secondary border-border font-mono text-xs" />
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-foreground font-semibold mb-4">Submit Deposit</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Amount ({selectedCrypto})</label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  className="bg-secondary border-border font-mono"
                />
              </div>
              <Button
                onClick={handleSubmitDeposit}
                disabled={submitting || !amount}
                className="w-full gradient-primary text-primary-foreground glow-primary"
              >
                {submitting ? "Submitting..." : "Confirm Deposit"}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-foreground font-semibold mb-4">Deposit History</h3>
          {deposits.length === 0 ? (
            <p className="text-muted-foreground text-sm">No deposits yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">Amount</th>
                    <th className="text-left py-3 font-medium">Currency</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50">
                      <td className="py-3 font-mono text-foreground">{tx.amount}</td>
                      <td className="py-3 text-foreground">{tx.currency}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          tx.status === "confirmed" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                        }`}>
                          {tx.status === "confirmed" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DepositPage;
