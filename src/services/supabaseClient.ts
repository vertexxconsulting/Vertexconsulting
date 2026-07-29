import { createClient } from '@supabase/supabase-js';

// Apenas a URL está exposta aqui. A ANON_KEY vai via VITE_SUPABASE_ANON_KEY no Vercel.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nzxxrnmaschelfggtzfv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
  console.warn(
    'VITE_SUPABASE_ANON_KEY não definida. Defina no Vercel (Dashboard > Project > Settings > Environment Variables).'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
