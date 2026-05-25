import { createClient } from '@supabase/supabase-js';

// Server-side client — uses service role key (full access, never exposed to browser)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
