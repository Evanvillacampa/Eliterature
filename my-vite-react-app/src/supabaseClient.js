import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("My URL is:", supabaseUrl);
console.log("My Key is:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);