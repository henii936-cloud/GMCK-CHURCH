import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://whixmdlslmlqrrhskadr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXhtZGxzbG1scXJyaHNrYWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzQyOTAsImV4cCI6MjA4ODY1MDI5MH0.rsHnlNxWsDQkuExAwZ6XOgUzHG3ncmYvEusQ48u_9RA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    multiTab: true
  }
});
