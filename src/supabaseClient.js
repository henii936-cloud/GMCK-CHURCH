import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION START ---
// Replace these values with your actual Supabase project details
const SUPABASE_URL = "https://whixmdlslmlqrrhskadr.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_jNLW1YdzLCmgecAjoV3tRQ_UrtNucxp";
// --- CONFIGURATION END ---

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
