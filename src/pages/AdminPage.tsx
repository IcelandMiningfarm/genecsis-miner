import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ArrowDownToLine, ArrowUpFromLine, Pickaxe, Check, X, RefreshCw, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const fetchBtcPrice = async (): Promise<number> => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { headers: { "x-cg-demo-api-key": "CG-9kLivg9HmUeX7VwDSgehcpLj" } }
    );
    if (!res.ok) return 63000;
    const data = await res.json();
    return data.bitcoin?.usd ?? 63000;
  } catch {
    return 63000;
  }
};

const AdminPage = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState(63000);

  const loadAll = async () => {
    setLoading(true);
    const [p, d, w, pu, b] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("deposits").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabase.from("user_purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("user_balances").select("*"),
    ]);
    setProfiles(p.data ?? []);
    setDeposits(d.data ?? []);
    setWithdrawals(w.data ?? []);
    setPurchases(pu.data ?? []);
    setBalances(b.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  const getBalance = (userId: string) => balances.find((b) => b.user_id === userId);
  const getProfile = (userId: string) => profiles.find((p) => p.user_id === userId);

  const approveDeposit = async (deposit: any) => {
    const { error } = await supabase.from("deposits").update({ status: "confirmed" }).eq("id", deposit.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    // Credit user balance
    const bal = getBalance(deposit.user_id);
    if (bal) {
      const field = deposit.currency === "BTC" ? "btc_balance" : "usdt_balance";
      await supabase.from("user_balances").update({
        [field]: Number(bal[field]) + Number(deposit.amount),
        updated_at: new Date().toISOString(),
      }).eq("user_id", deposit.user_id);
    }

    // Activate any pending purchases for this user
    await supabase.from("user_purchases").update({ status: "active" }).eq("user_id", deposit.user_id).eq("status", "pending");

    toast({ title: "Deposit approved & balance credited" });
    loadAll();
  };

  const rejectDeposit = async (id: string) => {
    await supabase.from("deposits").update({ status: "rejected" }).eq("id", id);
    toast({ title: "Deposit rejected" });
    loadAll();
  };

  const approveWithdrawal = async (withdrawal: any) => {
    const { error } = await supabase.from("withdrawals").update({ status: "approved" }).eq("id", withdrawal.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Withdrawal approved" });
    loadAll();
  };

  const rejectWithdrawal = async (id: string) => {
    await supabase.from("withdrawals").update({ status: "rejected" }).eq("id", id);
    toast({ title: "Withdrawal rejected" });
    loadAll();
  };

  const activatePlan = async (id: string) => {
    await supabase.from("user_purchases").update({ status: "active" }).eq("id", id);
    toast({ title: "Plan activated" });
    loadAll();
  };

  if (adminLoading) return <DashboardLayout><p className="text-muted-foreground">Loading...</p></DashboardLayout>;
  if (!isAdmin) return <DashboardLayout><p className="text-destructive font-semibold text-lg">Access Denied — Admin only</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage users, deposits, withdrawals & plans</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1.5" />Users</TabsTrigger>
            <TabsTrigger value="deposits"><ArrowDownToLine className="h-4 w-4 mr-1.5" />Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals"><ArrowUpFromLine className="h-4 w-4 mr-1.5" />Withdrawals</TabsTrigger>
            <TabsTrigger value="plans"><Pickaxe className="h-4 w-4 mr-1.5" />Plans</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">Email</th>
                    <th className="text-left py-3 font-medium">Username</th>
                    <th className="text-left py-3 font-medium">BTC Balance</th>
                    <th className="text-left py-3 font-medium">USDT Balance</th>
                    <th className="text-left py-3 font-medium">Referral Code</th>
                    <th className="text-left py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => {
                    const bal = getBalance(p.user_id);
                    return (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-3 text-foreground">{p.email}</td>
                        <td className="py-3 text-muted-foreground">{p.username ?? "—"}</td>
                        <td className="py-3 font-mono text-accent">₿{bal?.btc_balance?.toFixed(6) ?? "0"}</td>
                        <td className="py-3 font-mono text-primary">${bal?.usdt_balance?.toFixed(2) ?? "0"}</td>
                        <td className="py-3 font-mono text-xs">{p.referral_code ?? "—"}</td>
                        <td className="py-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {profiles.length === 0 && <p className="text-muted-foreground text-sm mt-4">No users found.</p>}
            </motion.div>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">User</th>
                    <th className="text-left py-3 font-medium">Amount</th>
                    <th className="text-left py-3 font-medium">Currency</th>
                    <th className="text-left py-3 font-medium">TX Hash</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Date</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => {
                    const profile = getProfile(d.user_id);
                    return (
                      <tr key={d.id} className="border-b border-border/50">
                        <td className="py-3 text-foreground text-xs">{profile?.email ?? d.user_id.slice(0, 8)}</td>
                        <td className="py-3 font-mono font-semibold">{d.amount}</td>
                        <td className="py-3">{d.currency}</td>
                        <td className="py-3 font-mono text-xs text-muted-foreground max-w-[120px] truncate">{d.tx_hash ?? "—"}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            d.status === "confirmed" ? "bg-primary/10 text-primary" :
                            d.status === "rejected" ? "bg-destructive/10 text-destructive" :
                            "bg-accent/10 text-accent"
                          }`}>{d.status}</span>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                        <td className="py-3">
                          {d.status === "pending" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-7 text-xs border-primary text-primary" onClick={() => approveDeposit(d)}>
                                <Check className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs border-destructive text-destructive" onClick={() => rejectDeposit(d.id)}>
                                <X className="h-3 w-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {deposits.length === 0 && <p className="text-muted-foreground text-sm mt-4">No deposits found.</p>}
            </motion.div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">User</th>
                    <th className="text-left py-3 font-medium">Amount</th>
                    <th className="text-left py-3 font-medium">Currency</th>
                    <th className="text-left py-3 font-medium">Wallet</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Date</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => {
                    const profile = getProfile(w.user_id);
                    return (
                      <tr key={w.id} className="border-b border-border/50">
                        <td className="py-3 text-foreground text-xs">{profile?.email ?? w.user_id.slice(0, 8)}</td>
                        <td className="py-3 font-mono font-semibold">{w.amount}</td>
                        <td className="py-3">{w.currency}</td>
                        <td className="py-3 font-mono text-xs text-muted-foreground max-w-[150px] truncate">{w.wallet_address}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            w.status === "approved" ? "bg-primary/10 text-primary" :
                            w.status === "rejected" ? "bg-destructive/10 text-destructive" :
                            "bg-accent/10 text-accent"
                          }`}>{w.status}</span>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                        <td className="py-3">
                          {w.status === "pending" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-7 text-xs border-primary text-primary" onClick={() => approveWithdrawal(w)}>
                                <Check className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs border-destructive text-destructive" onClick={() => rejectWithdrawal(w.id)}>
                                <X className="h-3 w-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {withdrawals.length === 0 && <p className="text-muted-foreground text-sm mt-4">No withdrawals found.</p>}
            </motion.div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">User</th>
                    <th className="text-left py-3 font-medium">Plan</th>
                    <th className="text-left py-3 font-medium">Price</th>
                    <th className="text-left py-3 font-medium">Daily Earn</th>
                    <th className="text-left py-3 font-medium">Duration</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Expires</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => {
                    const profile = getProfile(p.user_id);
                    return (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-3 text-foreground text-xs">{profile?.email ?? p.user_id.slice(0, 8)}</td>
                        <td className="py-3 font-semibold">{p.plan_name}</td>
                        <td className="py-3 font-mono">${p.plan_price}</td>
                        <td className="py-3 font-mono text-accent">{p.plan_type === "btc" ? `₿${p.daily_earning}` : `$${p.daily_earning}`}</td>
                        <td className="py-3">{p.duration_days}d</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.status === "active" ? "bg-primary/10 text-primary" :
                            p.status === "expired" ? "bg-muted text-muted-foreground" :
                            "bg-accent/10 text-accent"
                          }`}>{p.status}</span>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{new Date(p.expires_at).toLocaleDateString()}</td>
                        <td className="py-3">
                          {p.status === "pending" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs border-primary text-primary" onClick={() => activatePlan(p.id)}>
                              <Check className="h-3 w-3 mr-1" /> Activate
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {purchases.length === 0 && <p className="text-muted-foreground text-sm mt-4">No purchases found.</p>}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
