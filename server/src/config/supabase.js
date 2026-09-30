import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Support both running from workspace root and running from server/ directory
dotenv.config();
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (_) {}

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

if (!isSupabaseConfigured) {
  throw new Error(
    '[FATAL CONFIGURATION ERROR] Supabase PostgreSQL configuration is required! ' +
    'In-memory fallback is disabled. Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env.'
  );
}

console.log('[Database] Supabase client initialized with Service Role Key.');
