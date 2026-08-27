import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ognaofyqubojbokohljr.supabase.co';
// O placeholder permite que a landing page continue renderizando sem configuração local.
// As operações do CRM/formulário continuam retornando erro até a chave real ser definida.
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key';

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_ANON_KEY não definida. Defina no Vercel.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
