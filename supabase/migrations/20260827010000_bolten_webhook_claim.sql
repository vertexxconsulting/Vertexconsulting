-- ============================================================
-- VERTEX CRM — Claim atômico e lease para webhooks Bolten
-- ============================================================
ALTER TABLE public.bolten_webhook_events
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_bolten_webhook_processing
  ON public.bolten_webhook_events (processed_at, processing_started_at);
