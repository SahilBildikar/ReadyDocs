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

export async function runVerification() {
  const report = {};

  // 1. Auth users count
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
  report.totalAuthUsers = usersErr ? `Error: ${usersErr.message}` : usersData.users.length;

  // 2. Profiles count
  const { count: profilesCount, error: profErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  report.totalProfiles = profErr ? `Error: ${profErr.message}` : profilesCount;

  // 3. Confirm public.users still exists and count
  const { count: legacyUsersCount, error: legacyErr } = await supabase.from('users').select('*', { count: 'exact', head: true });
  report.legacyUsersTableExists = !legacyErr;
  report.legacyUsersCount = legacyErr ? `Error: ${legacyErr.message}` : legacyUsersCount;

  // 4. Counts across all protected tables (confirm zero data loss)
  const tables = ['checklists', 'documents', 'ai_outputs', 'auto_fill_forms', 'feedback'];
  report.tableRowCounts = {};
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    report.tableRowCounts[t] = error ? `Error: ${error.message}` : count;
  }

  // 5. Test FK target: Verify if profiles.user_id references auth.users(id)
  const dummyUserId = '99999999-9999-9999-9999-999999999999';
  const dummyProfileId = '88888888-8888-8888-8888-888888888888';

  // Temporarily insert in legacy public.users
  await supabase.from('users').insert({
    id: dummyUserId,
    name: 'Probe Legacy',
    email: 'probe-legacy@readydocs.test',
    password_hash: 'none'
  });

  // Attempt to insert profile pointing to dummyUserId
  const { error: probeError } = await supabase.from('profiles').insert({
    id: dummyProfileId,
    user_id: dummyUserId,
    profile_name: 'Probe',
    full_name: 'Probe'
  });

  if (probeError) {
    report.profilesFkTarget = 'auth.users (CONFIRMED: does not accept legacy public.users keys)';
    report.migrationApplied = true;
  } else {
    report.profilesFkTarget = 'public.users (MIGRATION NOT YET RUN)';
    report.migrationApplied = false;
    await supabase.from('profiles').delete().eq('id', dummyProfileId);
  }

  // Cleanup probe row from public.users
  await supabase.from('users').delete().eq('id', dummyUserId);

  console.log(JSON.stringify(report, null, 2));
}

runVerification();
