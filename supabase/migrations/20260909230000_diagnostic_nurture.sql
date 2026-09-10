-- Vertex diagnostic nurture funnel
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS diagnostic_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS diagnostic_invite_at timestamptz,
  ADD COLUMN IF NOT EXISTS diagnostic_invite_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS diagnostic_invite_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS diagnostic_completed_at timestamptz;

UPDATE public.contacts
SET diagnostic_token = gen_random_uuid()
WHERE diagnostic_token IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_diagnostic_token
  ON public.contacts (diagnostic_token)
  WHERE diagnostic_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_pending_diagnostic_invites
  ON public.contacts (diagnostic_invite_at)
  WHERE diagnostic_invite_sent = false AND diagnostic_invite_at IS NOT NULL;

COMMENT ON COLUMN public.contacts.diagnostic_invite_at IS 'Momento a partir do qual o convite do diagnóstico pode ser enviado.';
COMMENT ON COLUMN public.contacts.diagnostic_invite_sent IS 'Idempotência do convite automático do diagnóstico.';
