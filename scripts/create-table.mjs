const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf-8');
const anonKey = env.match(/SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!anonKey) {
  console.error('ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(
  'https://nzxxrnmaschelfggtzfv.supabase.co',
  anonKey
);

// Check if 'contacts' table exists
supabase.from('contacts').select('*').limit(1)
  .then(({ error }) => {
    if (error && error.message.includes('Could not find the table')) {
      console.log('Table "contacts" does not exist. Trying to create...');
      
      // Use the SQL endpoint via the service API
      const sql = `
        CREATE TABLE IF NOT EXISTS public.contacts (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          name text NOT NULL,
          email text NOT NULL,
          phone text,
          company text,
          service text NOT NULL,
          message text NOT NULL,
          status text DEFAULT 'Novo',
          priority text DEFAULT 'Média',
          notes text DEFAULT ''::text,
          whatsapp_sent boolean DEFAULT false,
          created_at timestamptz DEFAULT now()
        );
      `;
      
      // We can't create tables via anon key, so let's try the management API
      fetch('https://api.supabase.com/v1/projects/nzxxrnmaschelfggtzfv/database/query', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
      })
      .then(r => r.text())
      .then(d => console.log('Create result:', d.slice(0, 300)))
      .catch(e => console.error('Error:', e.message));
    } else if (error) {
      console.error('Unexpected error:', error.message);
    } else {
      console.log('Table "contacts" already exists!');
    }
  });
