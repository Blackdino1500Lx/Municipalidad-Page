document.addEventListener('DOMContentLoaded', async () => {
  const db = window.supabaseInstance;
  if (!db) return;

  const urlParams = new URLSearchParams(window.location.search);
  const blogId = parseInt(urlParams.get('id'), 10);
  if (isNaN(blogId)) return;

  // ✅ Cargar contenido del blog
  const { data: blog, error } = await db
    .from('Blog')
    .select('*')
    .eq('id', blogId)
    .single();

  if (error || !blog) return;

  document.querySelector('.main-title').textContent = blog.title || 'Sin título';
  document.querySelector('.feature-image img').src = blog.imagen_url || '../assets/img/placeholder.jpg';

  const contenidoEl = document.querySelector('.article-content');
  (blog.phar || '').split('\n').filter(p => p.trim()).forEach(texto => {
    const p = document.createElement('p');
    p.textContent = texto;
    contenidoEl.appendChild(p);
  });

  if (blog.phar2) {
    const frases = blog.phar2.split(/(?<!\.)\.\s+(?=[A-ZÁÉÍÓÚ])/g).map(f => f.trim()).filter(f => f);
    let buffer = '', parrafos = [];
    frases.forEach((frase, i) => {
      buffer += frase.endsWith('.') ? frase : frase + '.';
      if ((i + 1) % 2 === 0 || i === frases.length - 1) {
        parrafos.push(buffer.trim());
        buffer = '';
      } else {
        buffer += ' ';
      }
    });
    parrafos.forEach(texto => {
      const p = document.createElement('p');
      p.textContent = texto;
      p.classList.add('blog-parrafo-extra');
      p.style.marginTop = '1em';
      p.style.lineHeight = '1.6';
      contenidoEl.appendChild(p);
    });
  }

  // ✅ Cargar galería de imágenes
  const galeriaEl = document.querySelector('.image-gallery');
  const leftArrow = document.querySelector('.gallery-arrow.left');
  const rightArrow = document.querySelector('.gallery-arrow.right');

  // ✅ Mostrar flechas siempre
  leftArrow.classList.add('visible');
  rightArrow.classList.add('visible');

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
      img.style.cursor = 'pointer';

      // ✅ Reemplazar imagen principal al hacer clic
      img.addEventListener('click', () => {
        const principal = document.querySelector('.feature-image img');
        if (principal) principal.src = imgData.imagen_url;
      });

      galeriaEl.appendChild(img);
    });

    // ✅ Navegación horizontal con flechas
    leftArrow.addEventListener('click', () => {
      galeriaEl.scrollBy({ left: -200, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
      galeriaEl.scrollBy({ left: 200, behavior: 'smooth' });
    });
  } else {
    galeriaEl.innerHTML = '<p style="padding: 1rem;">No hay imágenes disponibles para esta entrada.</p>';
  }
});