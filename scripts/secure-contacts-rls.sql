-- ============================================================
-- Vertex Consulting — FECHAR RLS da tabela contacts
-- Rodar no Supabase > SQL Editor > Run
-- ============================================================
-- O que isso faz:
--  * Formulário público: pode INSERIR lead novo (status sempre 'Novo')
--  * Qualquer pessoa: NÃO pode ler/alterar/apagar leads
--  * Só quem está logado no CRM (Supabase Auth): lê/altera/apaga
--  * whatsapp_sent é marcado via função segura (security definer),
--    sem abrir UPDATE anônimo
-- ============================================================

-- 1) Garantir RLS habilitado
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 2) Remover políticas antigas (se existirem) — evita erro de duplicada
DROP POLICY IF EXISTS "contacts_insert_anon" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_auth" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_auth" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_auth" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_policy" ON public.contacts;

-- 3) INSERT: público pode criar lead, mas sempre como 'Novo'
--    (impede injetar lead já marcado como 'Fechado Ganho' etc.)
CREATE POLICY "contacts_insert_anon" ON public.contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'Novo' AND whatsapp_sent = false);

-- 4) SELECT: somente autenticado (quem está logado no CRM)
CREATE POLICY "contacts_select_auth" ON public.contacts
  FOR SELECT TO authenticated
  USING (true);

-- 5) UPDATE: somente autenticado
CREATE POLICY "contacts_update_auth" ON public.contacts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6) DELETE: somente autenticado
CREATE POLICY "contacts_delete_auth" ON public.contacts
  FOR DELETE TO authenticated
  USING (true);

-- 7) Função segura p/ marcar whatsapp_sent (formulário chama após envio)
--    Roda com privilégio do dono da tabela, só altera essa coluna,
--    não abre UPDATE anônimo geral.
CREATE OR REPLACE FUNCTION public.mark_whatsapp_sent(p_contact_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.contacts
     SET whatsapp_sent = true
   WHERE id = p_contact_id;
  RETURN FOUND;
END;
$$;

-- 8) Liberar a função para anon (formulário) e autenticado (CRM)
GRANT EXECUTE ON FUNCTION public.mark_whatsapp_sent(uuid) TO anon, authenticated;

-- ============================================================
-- FIM. Verificar depois com:
--   SELECT * FROM pg_policies WHERE tablename = 'contacts';
-- ============================================================
