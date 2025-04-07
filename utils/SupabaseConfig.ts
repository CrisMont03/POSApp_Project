import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://allfmlzffdjlgzjujlwg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbGZtbHpmZmRqbGd6anVqbHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTkxNDQsImV4cCI6MjA1OTE5NTE0NH0.CzlqZMmudIbWSHkOCLHMUG2rsjlkDGOH5fN1EKS5zgM";
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };