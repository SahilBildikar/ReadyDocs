import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

async function inspectData() {
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project-ref') || supabaseServiceKey.includes('your_supabase_service_role_key_here')) {
    console.log(JSON.stringify({
      configured: false,
      message: 'Credentials are not configured yet in server/.env.'
    }));
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const tables = ['profiles', 'checklists', 'documents', 'ai_outputs', 'auto_fill_forms', 'feedback'];
  const report = {};

  try {
    // 1. Fetch valid auth.users IDs
    const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authError) {
      console.log(JSON.stringify({ error: 'Failed to query auth.users: ' + authError.message }));
      return;
    }
    const validUserIds = new Set((authUsersData.users || []).map(u => u.id));
    report['auth_users_count'] = validUserIds.size;

    // 2. Inspect each table
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('id, user_id');
      if (error) {
        report[table] = { status: 'TABLE_NOT_FOUND_OR_ERROR', message: error.message };
        continue;
      }

      const totalRows = data.length;
      let linkedRows = 0;
      let orphanRows = 0;

      for (const row of data) {
        if (row.user_id && validUserIds.has(row.user_id)) {
          linkedRows++;
        } else if (table === 'feedback' && row.user_id === null) {
          // Anonymous feedback is permitted
          linkedRows++;
        } else {
          orphanRows++;
        }
      }

      report[table] = {
        totalRows,
        linkedRows,
        orphanRows
      };
    }

    console.log(JSON.stringify({
      configured: true,
      report
    }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({ error: err.message }));
  }
}

inspectData();
