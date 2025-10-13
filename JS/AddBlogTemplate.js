document.addEventListener('DOMContentLoaded', async () => {
  const db = window.supabaseInstance;
  if (!db) return;

  // ✅ Extraer el ID desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = parseInt(urlParams.get('id'), 10);

  if (isNaN(blogId)) {
    console.warn('ID de blog inválido en la URL.');
    return;
  }

  // ✅ Consultar el blog específico por ID
  const { data, error } = await db
    .from('Blog')
    .select('*')
    .eq('id', blogId)
    .single();

  if (error || !data) {
    console.error('No se pudo cargar el blog:', error);
    return;
  }

  const blog = data;

  document.querySelector('.main-title').textContent = blog.title || 'Sin título';
  document.querySelector('.feature-image img').src = blog.imagen_url || '../assets/img/placeholder.jpg';

  const contenidoEl = document.querySelector('.article-content');

  // Procesar campo phar (con saltos de línea si existen)
  const parrafos = (blog.phar || '').split('\n').filter(p => p.trim() !== '');
  parrafos.forEach(texto => {
    const p = document.createElement('p');
    p.textContent = texto;
    contenidoEl.appendChild(p);
  });

  // Función para dividir texto plano en párrafos por puntuación
  function dividirEnParrafosAgrupados(textoPlano) {
    const frases = textoPlano
      .split(/(?<!\.)\.\s+(?=[A-ZÁÉÍÓÚ])/g)
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const parrafos = [];
    let buffer = '';

    frases.forEach((frase, i) => {
      buffer += frase.endsWith('.') ? frase : frase + '.';
      if ((i + 1) % 2 === 0 || i === frases.length - 1) {
        parrafos.push(buffer.trim());
        buffer = '';
      } else {
        buffer += ' ';
      }
    });

    return parrafos.map(texto => {
      const p = document.createElement('p');
      p.textContent = texto;
      p.style.marginTop = '1em';
      p.style.lineHeight = '1.6';
      p.classList.add('blog-parrafo-extra');
      return p;
    });
  }

  // Procesar campo phar2 con división inteligente
  if (blog.phar2) {
    const parrafosExtra = dividirEnParrafosAgrupados(blog.phar2);
    parrafosExtra.forEach(p => contenidoEl.appendChild(p));
  }
});