import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

async function testConnection() {
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project-ref') || supabaseServiceKey.includes('your_supabase_service_role_key_here')) {
    console.log(JSON.stringify({
      configured: false,
      connected: false,
      authStatus: 'NOT_CONFIGURED',
      tablesReachable: false,
      message: 'Credentials are not configured or still have placeholder values.'
    }, null, 2));
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Test Auth admin connection
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const authSuccess = !authError;

    // 2. Test Reachability of Required Database Tables
    const requiredTables = ['profiles', 'checklists', 'documents', 'ai_outputs', 'auto_fill_forms', 'feedback', 'users'];
    const tableStatus = {};
    let allTablesReachable = true;

    for (const table of requiredTables) {
      const { error: tblError } = await supabase.from(table).select('id', { head: true, count: 'exact' });
      if (tblError) {
        tableStatus[table] = `ERROR: ${tblError.message}`;
        allTablesReachable = false;
      } else {
        tableStatus[table] = 'REACHABLE';
      }
    }

    console.log(JSON.stringify({
      configured: true,
      connected: authSuccess,
      authStatus: authSuccess ? 'SUCCESS' : `FAILED: ${authError.message}`,
      allTablesReachable,
      tableStatus
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({
      configured: true,
      connected: false,
      authStatus: 'ERROR',
      allTablesReachable: false,
      error: err.message
    }, null, 2));
  }
}

testConnection();
