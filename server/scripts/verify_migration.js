import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function checkMigrationState() {
  const result = {};

  // 1. Auth users count
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
  result.authUsers = usersErr ? usersErr.message : usersData.users.length;

  // 2. Profiles count
  const { count: profilesCount, error: profErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  result.profilesCount = profErr ? profErr.message : profilesCount;

  // 3. Try reading information_schema or system catalog
  const { data: fkData, error: fkErr } = await supabase.from('information_schema.table_constraints').select('*').limit(1);
  result.informationSchemaDirect = fkErr ? fkErr.message : 'ACCESSIBLE';

  // 4. Try reading pg_policies
  const { data: polData, error: polErr } = await supabase.from('pg_policies').select('*').limit(1);
  result.pgPoliciesDirect = polErr ? polErr.message : 'ACCESSIBLE';

  console.log(JSON.stringify(result, null, 2));
}

checkMigrationState();
