import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nzxxrnmaschelfggtzfv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eHhybm1hc2NoZWxmZ2d0emZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NDU0NDcsImV4cCI6MjEwMDQyMTQ0N30.Hh4vTVU88fHId0PWctE_NGeLpFm4Go042gz4lAutFwU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
