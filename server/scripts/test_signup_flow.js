import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { supabase } from '../src/config/supabase.js';

export async function testFlow() {
  console.log('--- Testing Supabase Auth & Checklist Flow ---');
  const testEmail = `test_flow_${Date.now()}@readydocs.test`;
  const testPassword = 'Password123!';
  const testName = 'Sahil ReadyDocs';

  // 1. Check if is_active column exists
  const { error: colErr } = await supabase.from('profiles').select('is_active').limit(1);
  const isActiveExists = !colErr;
  console.log('Database Check: profiles.is_active column exists:', isActiveExists);

  if (!isActiveExists) {
    console.log('\n[CRITICAL NOTE]: Please run in Supabase SQL Editor:');
    console.log('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;\n');
  }

  // 2. Register user using Supabase Auth admin API (simulates signup)
  console.log(`Creating user: ${testEmail}...`);
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      name: testName,
      full_name: testName
    }
  });

  if (authErr) {
    console.error('Failed to create user:', authErr.message);
    return { success: false, step: 'createUser', error: authErr.message, needsIsActiveColumn: !isActiveExists };
  }

  const userId = authData.user.id;
  console.log('SUCCESS: User created in auth.users with ID:', userId);

  // 3. Verify Primary Profile created by trigger
  console.log('Checking public.profiles for auto-created Primary Profile...');
  // Brief delay for trigger
  await new Promise(r => setTimeout(r, 1000));
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId);

  console.log('Profiles found:', profiles?.length || 0);
  if (profiles && profiles.length > 0) {
    console.log('SUCCESS: Primary Profile auto-created:', profiles[0].profile_name, `(id: ${profiles[0].id})`);
  } else {
    console.warn('Warning: Primary profile not found:', profErr?.message || 'No rows returned');
  }

  const profileId = profiles?.[0]?.id || null;

  // 4. Create SBI Checklist
  console.log('Creating SBI Savings Account checklist in Supabase...');
  const { data: checklist, error: chkErr } = await supabase
    .from('checklists')
    .insert([{
      id: crypto.randomUUID(),
      user_id: userId,
      profile_id: profileId,
      service_type: 'sbi_savings',
      institution_name: 'State Bank of India',
      status: 'in_progress',
      result_json: {
        mustCarry: [
          { id: 'aadhaar', name: 'Aadhaar Card', status: 'ready' },
          { id: 'pan', name: 'PAN Card', status: 'ready' }
        ],
        carryIfNeeded: [],
        beforeYouGo: ['Carry 2 passport size photographs'],
        missingDocuments: []
      },
      source_url: 'https://sbi.co.in',
      source_checked_at: new Date().toISOString(),
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select('*')
    .single();

  if (chkErr) {
    console.error('Failed to create checklist:', chkErr.message);
    return { success: false, step: 'createChecklist', error: chkErr.message };
  }

  console.log('SUCCESS: SBI Checklist created with ID:', checklist.id);

  // 5. Query checklist back from Supabase (simulating page reload)
  console.log('Querying checklist back from Supabase to confirm persistence...');
  const { data: fetchedChecklist, error: fetchErr } = await supabase
    .from('checklists')
    .select('*')
    .eq('id', checklist.id)
    .eq('user_id', userId)
    .single();

  if (fetchErr) {
    console.error('Failed to fetch checklist:', fetchErr.message);
    return { success: false, step: 'fetchChecklist', error: fetchErr.message };
  }

  console.log('SUCCESS: Checklist persisted and retrieved successfully:', fetchedChecklist.institution_name, `(status: ${fetchedChecklist.status})`);

  // Clean up test user & cascade delete profile + checklist
  console.log('Cleaning up test user and cascading data...');
  await supabase.auth.admin.deleteUser(userId);
  console.log('SUCCESS: All test data cleaned up safely.');

  return {
    success: true,
    userCreated: true,
    profileCreated: profiles?.length > 0,
    checklistCreatedAndPersisted: true
  };
}

testFlow();
