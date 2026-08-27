-- ============================================================
-- VERTEX CRM — Remove execução pública padrão dos RPCs
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.increment_unread(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_whatsapp_sent(uuid) FROM PUBLIC, anon, authenticated;
