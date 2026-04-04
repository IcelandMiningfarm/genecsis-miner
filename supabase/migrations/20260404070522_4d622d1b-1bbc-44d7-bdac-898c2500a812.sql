-- Drop if exists to avoid conflicts
DROP TRIGGER IF EXISTS generate_referral_code_trigger ON public.profiles;
DROP TRIGGER IF EXISTS process_referral ON public.profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Trigger: generate referral code on profile insert
CREATE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Trigger: process referral bonus when referred_by is set
CREATE TRIGGER process_referral
  AFTER UPDATE OF referred_by ON public.profiles
  FOR EACH ROW
  WHEN (OLD.referred_by IS DISTINCT FROM NEW.referred_by AND NEW.referred_by IS NOT NULL AND NEW.referred_by != '')
  EXECUTE FUNCTION public.handle_referral_bonus();

-- Trigger: auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();