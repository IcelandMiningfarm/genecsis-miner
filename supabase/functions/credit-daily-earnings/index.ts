import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all active purchases that haven't expired
    const { data: activePurchases, error: fetchError } = await supabase
      .from("user_purchases")
      .select("user_id, daily_earning")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch purchases: ${fetchError.message}`);
    }

    if (!activePurchases || activePurchases.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active plans to credit", credited: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate earnings per user
    const earningsByUser: Record<string, number> = {};
    for (const p of activePurchases) {
      earningsByUser[p.user_id] = (earningsByUser[p.user_id] || 0) + p.daily_earning;
    }

    let credited = 0;
    for (const [userId, dailyTotal] of Object.entries(earningsByUser)) {
      // Get current balance
      const { data: balance, error: balErr } = await supabase
        .from("user_balances")
        .select("btc_balance")
        .eq("user_id", userId)
        .single();

      if (balErr || !balance) continue;

      const newBalance = Number(balance.btc_balance) + dailyTotal;

      const { error: updateErr } = await supabase
        .from("user_balances")
        .update({ btc_balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (!updateErr) {
        credited++;
        // Log each plan's earning individually for history
        const userPurchases = activePurchases.filter(p => p.user_id === userId);
        for (const purchase of userPurchases) {
          await supabase.from("earnings_history").insert({
            user_id: userId,
            amount: purchase.daily_earning,
            plan_name: purchase.plan_name || "Mining Plan",
          });
        }
      }
    }

    // Expire plans that have passed their expiration date
    await supabase
      .from("user_purchases")
      .update({ status: "expired" })
      .eq("status", "active")
      .lte("expires_at", new Date().toISOString());

    return new Response(
      JSON.stringify({ message: "Daily earnings credited", credited }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
