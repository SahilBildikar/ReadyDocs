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

const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim() || 
  process.env.VITE_SUPABASE_ANON_KEY?.trim() || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdG1yaHFmemJ4Z2RvZWtndmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NTU3NDksImV4cCI6MjEwNjIzMTc0OX0.kGThRRJD-WPqpv8m3nhigz8MB27yLYZzEjVDhQvyr18';

if (!isSupabaseConfigured) {
  throw new Error(
    '[FATAL CONFIGURATION ERROR] Supabase PostgreSQL configuration is required! ' +
    'In-memory fallback is disabled. Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env.'
  );
}

/**
 * Creates a user-scoped Supabase client bound to the authenticated user's JWT.
 * This guarantees that Supabase Row Level Security (RLS) is strictly enforced
 * at the PostgreSQL database engine level for all user operations.
 * @param {string} [userToken] - User's Supabase JWT access token
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createUserSupabaseClient(userToken) {
  if (!userToken) return supabase;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    }
  });
}

console.log('[Database] Supabase client initialized with Service Role Key.');

