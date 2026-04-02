import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpFromLine, Clock, CheckCircle2, XCircle, AlertTriangle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const PENDING_HOURS = 24;

const getTimeRemaining = (createdAt: string) => {
  const created = new Date(createdAt).getTime();
  const deadline = created + PENDING_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  const diff = deadline - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
};

const WithdrawPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [, setTick] = useState(0);

  // Tick every second for countdown
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: bal } = await supabase
        .from("user_balances")
        .select("btc_balance")
        .eq("user_id", user.id)
        .single();
      setBalance(bal?.btc_balance ?? 0);

      const { data: withs } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setWithdrawals(withs ?? []);
    };
    load();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !amount || !walletAddress || parseFloat(amount) <= 0) return;
    if (parseFloat(amount) > balance) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user.id,
        amount: parseFloat(amount),
        currency: "BTC",
        wallet_address: walletAddress,
        status: "pending",
      });
      if (error) throw error;
      toast({ title: "Withdrawal requested", description: "Your withdrawal will be processed after 24 hours pending period." });
      setAmount("");
      setWalletAddress("");
      const { data } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setWithdrawals(data ?? []);
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
          <h1 className="text-2xl font-bold text-foreground">Withdraw</h1>
          <p className="text-muted-foreground text-sm mt-1">Request a withdrawal from your balance</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <ArrowUpFromLine className="h-5 w-5 text-primary" />
              <h3 className="text-foreground font-semibold">Request Withdrawal</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Wallet Address</label>
                <Input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your BTC wallet address"
                  className="bg-secondary border-border font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Amount (BTC)</label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  className="bg-secondary border-border font-mono"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Available: {balance.toFixed(6)} BTC</span>
                <button onClick={() => setAmount(String(balance))} className="text-primary hover:underline">Max</button>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Network Fee</span><span className="font-mono">0.0001 BTC</span>
                </div>
                <div className="flex justify-between text-xs text-foreground font-medium">
                  <span>You Receive</span>
                  <span className="font-mono">{amount ? Math.max(0, parseFloat(amount) - 0.0001).toFixed(6) : "0.000000"} BTC</span>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !amount || !walletAddress}
                className="w-full gradient-primary text-primary-foreground glow-primary"
              >
                {submitting ? "Submitting..." : "Submit Withdrawal"}
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-foreground font-semibold mb-4">Withdrawal Info</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Timer className="h-3.5 w-3.5 text-accent" />
                  <p className="text-sm text-foreground font-medium">24-Hour Pending Period</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">All withdrawals are held for 24 hours before being processed by admin for security purposes.</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-foreground font-medium">Processing Time</p>
                <p className="text-xs text-muted-foreground mt-1">After the 24-hour pending period, withdrawals are processed within 24 hours after admin approval.</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-accent" />
                  <p className="text-sm text-foreground font-medium">Minimum Withdrawal</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">0.005 BTC or 50 USDT</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-foreground font-medium">Network Fees</p>
                <p className="text-xs text-muted-foreground mt-1">BTC: 0.0001 BTC · USDT (TRC20): 1 USDT</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-foreground font-semibold mb-4">Withdrawal History</h3>
          {withdrawals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No withdrawals yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">Amount</th>
                    <th className="text-left py-3 font-medium">Address</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Countdown</th>
                    <th className="text-left py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((tx) => {
                    const remaining = tx.status === "pending" ? getTimeRemaining(tx.created_at) : null;
                    return (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-3 font-mono text-foreground">{tx.amount} {tx.currency}</td>
                        <td className="py-3 font-mono text-muted-foreground text-xs">{tx.wallet_address.slice(0, 10)}...{tx.wallet_address.slice(-4)}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                            tx.status === "completed" ? "bg-primary/10 text-primary" :
                            tx.status === "pending" ? "bg-accent/10 text-accent" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {tx.status === "completed" ? <CheckCircle2 className="h-3 w-3" /> :
                             tx.status === "pending" ? <Clock className="h-3 w-3" /> :
                             <XCircle className="h-3 w-3" />}
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {remaining ? (
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-accent">
                              <Timer className="h-3 w-3" />
                              {remaining}
                            </span>
                          ) : tx.status === "pending" ? (
                            <span className="text-xs text-primary">Ready for processing</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default WithdrawPage;
