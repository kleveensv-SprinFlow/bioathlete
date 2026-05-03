const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testColumns() {
  const columns = ["username", "is_premium", "bio", "avatar_url", "photos", "full_name", "views_count"];
  for (const col of columns) {
    const { data, error } = await supabase.from('profiles').select(col).limit(1);
    if (error) {
      console.log(`Column '${col}' failed:`, error.message);
    } else {
      console.log(`Column '${col}' exists and works.`);
    }
  }
}

testColumns();
