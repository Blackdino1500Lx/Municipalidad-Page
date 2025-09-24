//URL y Key cambian
const supabaseUrl = "https://fexilgbdtdhsziincyxn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleGlsZ2JkdGRoc3ppaW5jeXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjIzNjcsImV4cCI6MjA3NDIzODM2N30.f5DhJlEXdB_mLhFnhMLJ71WAqmRN-vJlgmiRTI01QMo";
let supabase = null;
if (window.supabase) {
  supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
} else if (typeof Supabase !== 'undefined') {
  supabase = Supabase.createClient(supabaseUrl, supabaseKey);
}
window.supabaseInstance = supabase;
export { supabase };