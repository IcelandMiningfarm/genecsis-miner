import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EarningEntry {
  id: string;
  amount: number;
  plan_name: string;
  credited_at: string;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("earnings_history")
        .select("*")
        .eq("user_id", user.id)
        .order("credited_at", { ascending: false })
        .limit(100);
      setEarnings((data as EarningEntry[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Earnings History</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your daily mining income</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : earnings.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No earnings recorded yet.</p>
              <p className="text-muted-foreground text-sm mt-1">
                Earnings are credited daily for active mining plans.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">Date</th>
                    <th className="text-left py-3 font-medium">Plan</th>
                    <th className="text-left py-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e) => (
                    <tr key={e.id} className="border-b border-border/50">
                      <td className="py-3 text-muted-foreground">
                        {new Date(e.credited_at).toLocaleDateString()} {new Date(e.credited_at).toLocaleTimeString()}
                      </td>
                      <td className="py-3 text-foreground font-medium">{e.plan_name}</td>
                      <td className="py-3 font-mono text-primary">₿ {e.amount.toFixed(6)}</td>
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

export default OrdersPage;
