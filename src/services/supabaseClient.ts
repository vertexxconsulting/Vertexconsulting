import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wuxylvutyibfqdphjaex.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1eHlsdnV0eWliZnFkcGhqYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTEwOTMsImV4cCI6MjEwNDIyNzA5M30.y800sR6cKG6HwGS9xuluq-mnWqsCUn03T7PE12gkqIc';

if (!SUPABASE_KEY) {
  console.warn('VITE_SUPABASE_ANON_KEY não definida. Defina no Vercel.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
