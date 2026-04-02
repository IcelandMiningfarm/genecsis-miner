import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Users, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const ReferralPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .single();
      setReferralCode(profile?.referral_code ?? "");

      const { data: refs } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      setReferrals(refs ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  const totalEarned = referrals.reduce((sum, r) => sum + Number(r.bonus_amount), 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Referral Program</h1>
          <p className="text-muted-foreground text-sm mt-1">Invite friends — you both earn $20 USDT!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Total Referrals</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5 text-center">
            <Gift className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent">${totalEarned}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 text-center">
            <Share2 className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">$20</p>
            <p className="text-xs text-muted-foreground">Per Referral</p>
          </motion.div>
        </div>

        {/* Referral Code & Link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h3 className="text-foreground font-semibold mb-4">Your Referral Code</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Code</label>
              <div className="flex gap-2">
                <Input value={referralCode} readOnly className="bg-secondary border-border font-mono text-lg font-bold tracking-widest" />
                <Button onClick={() => handleCopy(referralCode)} variant="outline" size="icon" className="border-border shrink-0">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Referral Link</label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="bg-secondary border-border font-mono text-xs" />
                <Button onClick={() => handleCopy(referralLink)} variant="outline" size="icon" className="border-border shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-foreground font-medium">How it works</p>
            <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
              <li>Share your referral code or link with friends</li>
              <li>They sign up using your code</li>
              <li>You both receive $20 USDT credited to your balances</li>
            </ol>
          </div>
        </motion.div>

        {/* Referral History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-foreground font-semibold mb-4">Referral History</h3>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : referrals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No referrals yet. Share your code to start earning!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-3 font-medium">Date</th>
                    <th className="text-left py-3 font-medium">Bonus</th>
                    <th className="text-left py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="border-b border-border/50">
                      <td className="py-3 text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</td>
                      <td className="py-3 font-mono text-accent">${ref.bonus_amount} USDT</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          <Check className="h-3 w-3" /> {ref.status}
                        </span>
                      </td>
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

export default ReferralPage;
