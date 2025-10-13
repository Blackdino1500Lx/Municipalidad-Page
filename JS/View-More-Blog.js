document.addEventListener('DOMContentLoaded', () => {
  const db = window.supabaseInstance;
  const contenedor = document.querySelector('.blog-flexbox');
  const verMasBtn = document.querySelector('.btn-view-more-blog');

  let blogsMostrados = 0;
  const blogsPorCarga = 6;

  async function cargarBlogs() {
    if (!db || !contenedor) {
      console.warn('Supabase o contenedor no disponible.');
      return;
    }

    console.log('Ejecutando cargarBlogs...');

    const { data, error } = await db
    //
      .from('Blog')
      .select('*')
      .range(blogsMostrados, blogsMostrados + blogsPorCarga - 1);

    console.log('Data recibida:', data);
    if (error) {
      console.error('Error al obtener blogs:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No hay blogs nuevos para mostrar.');
      verMasBtn.style.display = 'none';
      return;
    }

    data.forEach(blog => {
      const card = document.createElement('article');
      card.classList.add('blog-card');

      const imgDiv = document.createElement('div');
      imgDiv.classList.add('img-blog');
      const img = document.createElement('img');
      img.src = blog.imagen_url || '../assets/img/placeholder.jpg';
      img.alt = blog.title || 'Imagen del blog';
      imgDiv.appendChild(img);

      const textDiv = document.createElement('div');
      textDiv.classList.add('title-text');
      const titulo = document.createElement('h2');
      titulo.textContent = blog.title || 'Sin título';
      const parrafo = document.createElement('p');
      parrafo.textContent = blog.phar || 'Sin descripción';

      const btnDiv = document.createElement('div');
      btnDiv.classList.add('btn-blog');
      const enlace = document.createElement('a');
      enlace.href = `blog-template.html?id=${blog.id}`;
      enlace.classList.add('btn-view-more');
      enlace.setAttribute('aria-label', `Leer más sobre ${blog.title}`);
      enlace.textContent = 'Leer más';
      btnDiv.appendChild(enlace);

      textDiv.appendChild(titulo);
      textDiv.appendChild(parrafo);
      textDiv.appendChild(btnDiv);

      card.appendChild(imgDiv);
      card.appendChild(textDiv);
      contenedor.appendChild(card);
    });

    blogsMostrados += data.length;
    console.log(`✅ Blogs cargados: ${data.length}`);
  }

  if (verMasBtn) {
    verMasBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Botón clickeado. Cargando blogs...');
      cargarBlogs();
    });
  } else {
    console.warn('Botón "Ver más artículos del blog" no encontrado.');
  }
});