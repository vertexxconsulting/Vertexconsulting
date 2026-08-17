import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ognaofyqubojbokohljr.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_KEY) {
  console.warn('VITE_SUPABASE_ANON_KEY não definida. Defina no Vercel.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
