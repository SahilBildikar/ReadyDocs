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

async function testFkTarget() {
  const dummyUserId = '22222222-2222-2222-2222-222222222222';
  const dummyProfileId = '33333333-3333-3333-3333-333333333333';

  try {
    // 1. Insert dummy user in public.users
    const { error: userInsertErr } = await supabase.from('users').insert({
      id: dummyUserId,
      name: 'FK Test',
      email: 'fk-test@example.com',
      password_hash: 'hash'
    });

    if (userInsertErr) {
      console.log('Error inserting into public.users:', userInsertErr);
      return;
    }

    // 2. Try inserting profile referencing dummyUserId
    const { error: profInsertErr } = await supabase.from('profiles').insert({
      id: dummyProfileId,
      user_id: dummyUserId,
      profile_name: 'FK Test Profile',
      full_name: 'FK Test Profile'
    });

    if (profInsertErr) {
      console.log('Profile insert failed:', profInsertErr.message);
      console.log('RESULT: profiles_user_id_fkey points to auth.users (Migration has been applied!)');
    } else {
      console.log('Profile insert succeeded!');
      console.log('RESULT: profiles_user_id_fkey points to public.users (Migration NOT yet applied)');
      // Clean up profile
      await supabase.from('profiles').delete().eq('id', dummyProfileId);
    }

    // Clean up dummy user from public.users
    await supabase.from('users').delete().eq('id', dummyUserId);

  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testFkTarget();
