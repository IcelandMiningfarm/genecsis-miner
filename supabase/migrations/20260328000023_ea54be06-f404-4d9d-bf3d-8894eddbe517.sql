
CREATE TABLE public.earnings_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  plan_name TEXT NOT NULL,
  credited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.earnings_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings history"
  ON public.earnings_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert earnings"
  ON public.earnings_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
