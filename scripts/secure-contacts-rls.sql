ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_insert_anon" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_auth" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_auth" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_auth" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_policy" ON public.contacts;

CREATE POLICY "contacts_insert_anon" ON public.contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'Novo' AND whatsapp_sent = false);

CREATE POLICY "contacts_select_auth" ON public.contacts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "contacts_update_auth" ON public.contacts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "contacts_delete_auth" ON public.contacts
  FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.mark_whatsapp_sent(p_contact_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.contacts SET whatsapp_sent = true WHERE id = p_contact_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_whatsapp_sent(uuid) TO anon, authenticated;
