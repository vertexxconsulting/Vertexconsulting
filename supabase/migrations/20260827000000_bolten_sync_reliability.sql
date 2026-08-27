-- ============================================================
-- VERTEX CRM — Confiabilidade do espelho Bolten
-- Aplicar no mesmo projeto Supabase antes do próximo deploy.
-- ============================================================

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS bolten_sync_status text DEFAULT 'pending' NOT NULL,
  ADD COLUMN IF NOT EXISTS bolten_sync_error text,
  ADD COLUMN IF NOT EXISTS bolten_last_synced_at timestamptz;

UPDATE public.contacts
SET
  bolten_sync_status = 'synced',
  bolten_last_synced_at = COALESCE(bolten_last_synced_at, created_at),
  bolten_sync_error = NULL
WHERE bolten_opportunity_id IS NOT NULL
  AND bolten_sync_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_contacts_bolten_sync_status
  ON public.contacts (bolten_sync_status);

CREATE TABLE IF NOT EXISTS public.bolten_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz DEFAULT now() NOT NULL,
  processed_at timestamptz,
  error text
);

ALTER TABLE public.bolten_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bolten_webhook_events FROM anon, authenticated;
