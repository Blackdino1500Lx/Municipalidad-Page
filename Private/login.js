// login.js
// Script para login con email y contraseña usando Supabase

// Asegúrate de que supabaseInstance esté inicializado globalmente (como en supabase.js)
const supabase = window.supabaseInstance;

// Selecciona el formulario por clase 'pass' (como en tu HTML)
const loginForm = document.querySelector('form.pass');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('mail').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Error de autenticación: ' + error.message);
      return;
    }
    alert('Login exitoso');
    window.location.href = 'Panel.html';
  });
}
