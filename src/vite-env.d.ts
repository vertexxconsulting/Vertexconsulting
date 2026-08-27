/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BOLTEN_WHATSAPP_NUMBER: string;
  readonly VITE_BOLTEN_WHATSAPP_LINK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
