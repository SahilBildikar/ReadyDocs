import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// Check if valid non-placeholder credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-ref') &&
  supabaseServiceKey &&
  !supabaseServiceKey.includes('your_supabase_service_role_key_here')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

if (isSupabaseConfigured) {
  console.log('[Database] Supabase client initialized with Service Role Key.');
} else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[FATAL ERROR] Supabase PostgreSQL configuration is required in production! ' +
      'In-memory fallback is strictly disabled in production. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  console.warn(
    '[Database] [DEVELOPMENT ONLY] Live Supabase credentials are not configured in server/.env yet.\n' +
    'The server is operating in development mode with an in-memory repository fallback.\n' +
    'In-memory fallback is automatically disabled in production.\n' +
    'To connect your live Supabase database, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env.'
  );
}
