-- ============================================================
-- VERTEX CONSULTING — Schema completo para novo projeto Supabase
-- Gerado a partir do dump fiel do banco original + melhorias
-- Pode rodar no SQL Editor do novo projeto (é idempotente)
-- ============================================================

-- ── Tabelas ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.contacts (
    id                 uuid        DEFAULT gen_random_uuid() NOT NULL,
    name               text        NOT NULL,
    email              text        NOT NULL,
    phone              text,
    company            text,
    service            text        NOT NULL,
    message            text        NOT NULL,
    status             text        DEFAULT 'Novo'::text,
    priority           text        DEFAULT 'Média'::text,
    notes              text        DEFAULT ''::text,
    whatsapp_sent      boolean     DEFAULT false,
    created_at         timestamptz DEFAULT now(),
    has_site           text        DEFAULT ''::text,
    instagram          text        DEFAULT ''::text,
    bolten_contact_id  uuid,
    bolten_opportunity_id uuid,
    bolten_status      text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id               uuid         DEFAULT gen_random_uuid() NOT NULL,
    contact_id       uuid,
    phone            text         NOT NULL,
    name             text,
    status           text         DEFAULT 'Ativo'::text NOT NULL,
    last_message     text,
    last_message_at  timestamptz,
    unread_count     integer      DEFAULT 0 NOT NULL,
    created_at       timestamptz  DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id               uuid         DEFAULT gen_random_uuid() NOT NULL,
    conversation_id  uuid         NOT NULL,
    sender           text         NOT NULL,
    text             text         NOT NULL,
    timestamp        timestamptz  DEFAULT now() NOT NULL,
    status           text         DEFAULT 'sent'::text NOT NULL,
    evolution_id     text,
    PRIMARY KEY (id)
);

-- ── Índices e constraints ───────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS messages_evolution_id_key
  ON public.messages (evolution_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_bolten_contact_id
  ON public.contacts (bolten_contact_id) WHERE (bolten_contact_id IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_bolten_opportunity_id
  ON public.contacts (bolten_opportunity_id) WHERE (bolten_opportunity_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
  ON public.conversations (last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_conversations_phone
  ON public.conversations (phone);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON public.messages (conversation_id);

ALTER TABLE ONLY public.conversations
  ADD CONSTRAINT conversations_contact_id_fkey
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.messages
  ADD CONSTRAINT messages_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- ── Funções ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_whatsapp_sent(p_contact_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  UPDATE public.contacts SET whatsapp_sent = true WHERE id = p_contact_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_unread(p_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  UPDATE public.conversations
  SET unread_count = unread_count + 1
  WHERE phone = p_phone;
END;
$$;

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select_auth" ON public.contacts;
CREATE POLICY "contacts_select_auth" ON public.contacts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "contacts_insert_anon" ON public.contacts;
CREATE POLICY "contacts_insert_anon" ON public.contacts
  FOR INSERT TO authenticated, anon
  WITH CHECK ((status = 'Novo'::text) AND (whatsapp_sent = false));

DROP POLICY IF EXISTS "contacts_update_auth" ON public.contacts;
CREATE POLICY "contacts_update_auth" ON public.contacts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "contacts_delete_auth" ON public.contacts;
CREATE POLICY "contacts_delete_auth" ON public.contacts
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "agents_all_conversations" ON public.conversations;
CREATE POLICY "agents_all_conversations" ON public.conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "agents_all_messages" ON public.messages;
CREATE POLICY "agents_all_messages" ON public.messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_insert_conversations" ON public.conversations;
CREATE POLICY "service_insert_conversations" ON public.conversations
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "service_update_conversations" ON public.conversations;
CREATE POLICY "service_update_conversations" ON public.conversations
  FOR UPDATE TO service_role USING (true);

DROP POLICY IF EXISTS "service_insert_messages" ON public.messages;
CREATE POLICY "service_insert_messages" ON public.messages
  FOR INSERT TO service_role WITH CHECK (true);

-- ── Realtime (chat ao vivo) ─────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ════════════════════════════════════════════════════════════
-- USUÁRIOS DO CRM — descomente e TROQUE as senhas antes de rodar
-- (ou crie pelos menus: Authentication → Users → Add user)
-- ════════════════════════════════════════════════════════════

-- INSERT INTO auth.users
--   (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
--    confirmation_token, recovery_token, email_change_token_new, email_change,
--    created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
-- SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
--        'authenticated', 'authenticated', 'cassia.andinho@gmail.com',
--        crypt('TROQUE_A_SENHA_1', gen_salt('bf')), now(),
--        '', '', '', '', now(), now(),
--        '{"provider":"email","providers":["email"]}',
--        '{"email_verified":true}'
-- WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'cassia.andinho@gmail.com');

-- INSERT INTO auth.users
--   (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
--    confirmation_token, recovery_token, email_change_token_new, email_change,
--    created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
-- SELECT '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
--        'authenticated', 'authenticated', 'patrick_ps2010@hotmail.com',
--        crypt('TROQUE_A_SENHA_2', gen_salt('bf')), now(),
--        '', '', '', '', now(), now(),
--        '{"provider":"email","providers":["email"]}',
--        '{"email_verified":true}'
-- WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patrick_ps2010@hotmail.com');