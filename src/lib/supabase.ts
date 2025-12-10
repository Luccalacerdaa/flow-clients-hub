import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qjiahebakhvlbvkghtst.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqaWFoZWJha2h2bGJ2a2dodHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTI0NDAsImV4cCI6MjA4MDE2ODQ0MH0.HZbcVp5ebh88k5nm7tVtSRZ2hx_UGbrcemARqZMVjwU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

