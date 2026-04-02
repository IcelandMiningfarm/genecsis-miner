
-- Drop the old INSERT-only trigger
DROP TRIGGER IF EXISTS process_referral ON public.profiles;

-- Recreate as AFTER UPDATE trigger that fires when referred_by changes
CREATE TRIGGER process_referral
  AFTER UPDATE OF referred_by ON public.profiles
  FOR EACH ROW
  WHEN (OLD.referred_by IS DISTINCT FROM NEW.referred_by AND NEW.referred_by IS NOT NULL AND NEW.referred_by != '')
  EXECUTE FUNCTION handle_referral_bonus();
