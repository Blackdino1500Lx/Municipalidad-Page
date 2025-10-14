document.addEventListener('DOMContentLoaded', () => {
  const db = window.supabaseInstance;
  const modal = document.getElementById('commentModal');
  const abrirModalBtn = document.querySelector('.action-btn');
  const cerrarModalBtn = document.querySelector('.close');
  const form = modal?.querySelector('form');
  const contenedorComentarios = document.querySelector('.reviews-container');

  // Extraer y validar el blogId desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = parseInt(urlParams.get('id'), 10);

  if (!db || isNaN(blogId)) {
    console.warn('❌ Supabase o blogId inválido.');
    return;
  }

  // Mostrar el modal centrado
  abrirModalBtn?.addEventListener('click', () => {
    modal.style.display = 'flex'; // ✅ clave para centrar con flexbox
  });

  // Cerrar el modal
  cerrarModalBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Cargar comentarios desde Supabase
  async function cargarComentarios() {
    if (!contenedorComentarios) {
      console.warn('Contenedor de comentarios no encontrado.');
      return;
    }

    const { data, error } = await db
      .from('Comentarios')
      .select('User, Text, blog_id')
      .eq('blog_id', blogId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar comentarios:', error.message || error.details || error);
      return;
    }

    console.log('Comentarios recibidos:', data);

    contenedorComentarios.innerHTML = '';

    if (!data || data.length === 0) {
      contenedorComentarios.innerHTML = '<p>No hay comentarios aún.</p>';
      return;
    }

    data.forEach(comentario => {
      const card = document.createElement('div');
      card.classList.add('review-card');
      card.innerHTML = `
        <div class="review-user">
          <div class="avatar">👤</div>
          <div class="name">${comentario.User}</div>
        </div>
        <p class="review-text">"${comentario.Text}"</p>
      `;
      contenedorComentarios.appendChild(card);
    });
  }

  // Enviar comentario
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = form.name.value.trim();
    const texto = form.comment.value.trim();

    if (!nombre || !texto) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const { error } = await db
      .from('Comentarios')
      .insert([{ User: nombre, Text: texto, blog_id: blogId }]);

    if (error) {
      console.error('Error al guardar comentario:', error.message || error.details || error);
      alert('Hubo un problema al guardar tu comentario.');
      return;
    }

    form.reset();
    modal.style.display = 'none';
    await cargarComentarios();
  });

  // Inicializar carga de comentarios
  cargarComentarios();
});