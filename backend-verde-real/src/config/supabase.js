require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    '⚠️  SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos no .env'
  );
}

// Service role key: usada só no backend (nunca no app!) porque
// tem permissão total no Storage, ignorando políticas de bucket.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET_MIDIAS = 'midias';

module.exports = { supabase, BUCKET_MIDIAS };
