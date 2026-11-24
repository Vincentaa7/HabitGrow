-- 003_security_rls_hardening.sql
-- Hardens Row Level Security on profiles to prevent self-escalation of `role`
-- and sets the default timezone to Asia/Jakarta for Indonesian users.

-- 1. Prevent authenticated clients from modifying their own `role` column via REST API
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Only allow role modifications from service_role / postgres admin sessions
        IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'authenticated' THEN
            RAISE EXCEPTION 'Forbidden: users cannot modify their own role';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 2. Default timezone for new profiles
ALTER TABLE public.profiles
    ALTER COLUMN timezone SET DEFAULT 'Asia/Jakarta';
