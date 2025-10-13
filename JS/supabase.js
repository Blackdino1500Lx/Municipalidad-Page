// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://fexilgbdtdhsziincyxn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleGlsZ2JkdGRoc3ppaW5jeXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjIzNjcsImV4cCI6MjA3NDIzODM2N30.f5DhJlEXdB_mLhFnhMLJ71WAqmRN-vJlgmiRTI01QMo"; // tu anon key

const supabase = createClient(supabaseUrl, supabaseKey);
window.supabaseInstance = supabase;

console.log('✅ Supabase inicializado correctamente');
