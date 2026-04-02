import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://boglapzzvizphbfqolul.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_IPavHnP5UB_7o0R-YeVaJQ_bDpOTFFx";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Global features will be disabled.");
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
