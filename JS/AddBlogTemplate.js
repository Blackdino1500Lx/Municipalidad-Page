document.addEventListener('DOMContentLoaded', async () => {
  const db = window.supabaseInstance;
  if (!db) return;

  const urlParams = new URLSearchParams(window.location.search);
  const blogId = parseInt(urlParams.get('id'), 10);

  if (isNaN(blogId)) {
    console.warn('ID de blog inválido en la URL.');
    return;
  }

  // ✅ Cargar contenido del blog
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

  // ✅ Procesar campo phar
  const parrafos = (blog.phar || '').split('\n').filter(p => p.trim() !== '');
  parrafos.forEach(texto => {
    const p = document.createElement('p');
    p.textContent = texto;
    contenidoEl.appendChild(p);
  });

  // ✅ Procesar campo phar2 con división inteligente
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

  if (blog.phar2) {
    const parrafosExtra = dividirEnParrafosAgrupados(blog.phar2);
    parrafosExtra.forEach(p => contenidoEl.appendChild(p));
  }

  // ✅ Cargar galería de imágenes
  const galeriaEl = document.querySelector('.image-gallery');
  const leftArrow = document.querySelector('.gallery-arrow.left');
  const rightArrow = document.querySelector('.gallery-arrow.right');

  const { data: imagenes, error: galeriaError } = await db
    .from('blog_imagenes')
    .select('*')
    .eq('blog_id', blogId)
    .order('orden', { ascending: true });

  if (galeriaError) {
    console.error('Error al cargar galería:', galeriaError.message);
  }

  if (imagenes && imagenes.length > 0) {
    imagenes.forEach((imgData, index) => {
      const img = document.createElement('img');
      img.src = imgData.imagen_url;
      img.alt = imgData.alt_text || `Imagen ${index + 1}`;
      img.classList.add('gallery-thumb');
      galeriaEl.appendChild(img);
    });

    // ✅ Navegación con flechas
    let currentIndex = 0;
    const thumbs = galeriaEl.querySelectorAll('.gallery-thumb');

    function mostrarImagen(index) {
      thumbs.forEach((img, i) => {
        img.style.display = i === index ? 'block' : 'none';
        img.classList.toggle('active', i === index);
      });
    }

    leftArrow.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
      mostrarImagen(currentIndex);
    });

    rightArrow.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % thumbs.length;
      mostrarImagen(currentIndex);
    });

    mostrarImagen(currentIndex);
  } else {
    galeriaEl.innerHTML = '<p style="padding: 1rem;">No hay imágenes disponibles para esta entrada.</p>';
  }
});