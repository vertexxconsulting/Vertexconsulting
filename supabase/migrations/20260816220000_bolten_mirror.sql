-- ============================================================
-- VERTEX CRM — Espelho Bolten
-- Adiciona os IDs Bolten ao contato para sincronização 2 vias
-- Aplicar: Supabase Dashboard > SQL Editor (ou supabase db push)
-- ============================================================

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS bolten_contact_id    uuid,
  ADD COLUMN IF NOT EXISTS bolten_opportunity_id uuid,
  ADD COLUMN IF NOT EXISTS bolten_status        text;

-- Índices únicos parciais (apenas linhas com ID preenchido)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_bolten_contact_id
  ON contacts(bolten_contact_id)
  WHERE bolten_contact_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_bolten_opportunity_id
  ON contacts(bolten_opportunity_id)
  WHERE bolten_opportunity_id IS NOT NULL;