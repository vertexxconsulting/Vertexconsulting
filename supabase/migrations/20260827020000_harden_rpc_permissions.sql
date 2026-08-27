-- ============================================================
-- VERTEX CRM — Restringe funções privilegiadas ao backend
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.increment_unread(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_whatsapp_sent(uuid) FROM anon, authenticated;
