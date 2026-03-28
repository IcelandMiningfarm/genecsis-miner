
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by text;

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  bonus_amount numeric NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'credited',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.referral_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

CREATE OR REPLACE FUNCTION public.handle_referral_bonus()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  referrer_user_id uuid;
BEGIN
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by != '' THEN
    SELECT user_id INTO referrer_user_id FROM public.profiles WHERE referral_code = NEW.referred_by;
    IF referrer_user_id IS NOT NULL THEN
      UPDATE public.user_balances SET usdt_balance = usdt_balance + 20, updated_at = now() WHERE user_id = referrer_user_id;
      INSERT INTO public.referrals (referrer_id, referred_id, bonus_amount) VALUES (referrer_user_id, NEW.user_id, 20);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER process_referral AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_referral_bonus();
