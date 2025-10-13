// Agregar Eventos a la Base de Datos
// Obtener Datos del Formulario
// panel.js — Cliente ESM para el Panel de Administración
const supabase = window.supabaseInstance;

// Fallback si por alguna razón window.supabaseInstance existe (compatibilidad)
const db = supabase || window.supabaseInstance;

function attachFormListener(formId, handler) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', handler);
}

function subirConImagen({ formId, campos, tabla, campoImagen = 'imagen_url', inputImagenId = 'archivoimg', callback }) {
  attachFormListener(formId, async function (e) {
    e.preventDefault();
    if (!db) { alert('Supabase no inicializado'); return; }

    // Limitar la búsqueda de inputs al formulario enviado para evitar conflictos por IDs duplicados
    const form = e.currentTarget;

    const datos = {};
    for (const campo of campos) {
      // Busca por id o por name dentro del formulario
      const input = form.querySelector(`#${campo}, [name="${campo}"]`);
      datos[campo] = input ? input.value : '';
    }

    // Tomar el file input dentro del formulario actual
    const fileInput = form.querySelector(`#${inputImagenId}, [name="${inputImagenId}"]`);
    const archivo = fileInput?.files?.[0];
    let imagen_url = '';
    if (archivo) {
      const fileName = `${Date.now()}_${archivo.name}`;
      const { data: _upload, error: uploadError } = await db.storage.from('img').upload(fileName, archivo);
      if (uploadError) { console.error('Error subiendo imagen:', uploadError); alert('Error al subir imagen'); return; }
      imagen_url = `https://fexilgbdtdhsziincyxn.supabase.co/storage/v1/object/public/img/${fileName}`;
    }

    datos[campoImagen] = imagen_url;
    const { error } = await db.from(tabla).insert([datos]);
    if (error) { console.error('Error guardando:', error); alert('Error guardando datos'); return; }
    alert('Guardado correctamente');
    if (typeof callback === 'function') callback();
  });
}

// Mostrar eventos
export async function mostrardatos() {
  window.mostrardatos = mostrardatos;
  if (!db) return;
  const { data, error } = await db.from('Eventos').select('*');
  if (error) { console.error('Error obteniendo eventos:', error); return; }
  const contenedor = document.getElementById('preview'); if (!contenedor) return; contenedor.innerHTML = '';
  data.forEach(evento => {
    const card = document.createElement('div'); card.classList.add('card');
    const idEl = document.createElement('p'); idEl.classList.add('id-pre'); idEl.textContent = `ID: ${evento.id || ''}`; card.appendChild(idEl);
    const titulo = document.createElement('h1'); titulo.classList.add('titulo-pre'); titulo.textContent = evento.title || '';
    card.appendChild(titulo);
    if (evento.imagen_url) { const img = document.createElement('img'); img.classList.add('img-pre'); img.src = evento.imagen_url; img.alt = 'Imagen'; img.style.maxWidth = '100%'; card.appendChild(img); }
    const fechas = document.createElement('p'); fechas.textContent = `Inicio: ${evento.start || ''} | Fin: ${evento.end || ''}`; card.appendChild(fechas);
    const descripcion = document.createElement('p'); descripcion.textContent = `Descripción: ${evento.description || ''}`; card.appendChild(descripcion);
    const tipo = document.createElement('p'); tipo.textContent = `Tipo: ${evento.type || ''}`; card.appendChild(tipo);
    const ubicacion = document.createElement('p'); ubicacion.textContent = `Ubicación: ${evento.location || ''}`; card.appendChild(ubicacion);
    const coordinador = document.createElement('p'); coordinador.textContent = `Coordinador: ${evento.coordinator || ''}`; card.appendChild(coordinador);
    const estado = document.createElement('p'); estado.textContent = `Estado: ${evento.status || ''}`; card.appendChild(estado);
    contenedor.appendChild(card);
  });
}

// Procesar Excel
export async function procesarExcel() {
  const input = document.getElementById('archivoExcel');
  if (!input || !input.files || !input.files[0]) { alert('Selecciona un archivo Excel primero.'); return; }
  if (!window.XLSX) { alert('La librería XLSX no está cargada.'); return; }
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = window.XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = window.XLSX.utils.sheet_to_json(worksheet);
    for (const fila of jsonData) {
      const { titulo, parrafo, texto2 } = fila;
      await db.from('entradas').insert([{ titulo: titulo || '', parrafo: parrafo || '', texto2: texto2 || '' }]);
    }
    if (typeof mostrardatos === 'function') mostrardatos();
    alert('Datos importados correctamente');
  };
  reader.readAsArrayBuffer(file);
}
window.procesarExcel = procesarExcel;

// Mostrar blogs
export async function mostrardatosBlog() {
  window.mostrardatosBlog = mostrardatosBlog;
  if (!db) return;
  const { data, error } = await db.from('Blog').select('*');
  if (error) { console.error('Error obteniendo blogs:', error); return; }
  const contenedor = document.getElementById('preview'); if (!contenedor) return; contenedor.innerHTML = '';
  data.forEach(blog => {
    const card = document.createElement('div'); card.classList.add('card');
    const idEl = document.createElement('p'); idEl.classList.add('id-pre'); idEl.textContent = `ID: ${blog.id || ''}`; card.appendChild(idEl);
    const titulo = document.createElement('h3'); titulo.classList.add('titulo-pre'); titulo.textContent = blog.title || blog.titulo || '';
    card.appendChild(titulo);
    if (blog.imagen_url) { const img = document.createElement('img'); img.classList.add('img-pre'); img.src = blog.imagen_url; img.alt = 'Imagen'; img.style.maxWidth = '100%'; card.appendChild(img); }
    const texto1 = document.createElement('p'); texto1.classList.add('text1'); texto1.textContent = `Texto 1: ${blog.phar || blog.parrafo || ''}`; card.appendChild(texto1);
    const texto2 = document.createElement('p'); texto2.classList.add('text2'); texto2.textContent = `Texto 2: ${blog.phar2 || blog.texto2 || ''}`; card.appendChild(texto2);
    contenedor.appendChild(card);
  });
}

// Mostrar banners
export async function mostrardatosBanner() {
  window.mostrardatosBanner = mostrardatosBanner;
  if (!db) return;
  const { data, error } = await db.from('Banner').select('*');
  if (error) { console.error('Error obteniendo banners:', error); return; }
  const contenedor = document.getElementById('preview'); if (!contenedor) return; contenedor.innerHTML = '';
  data.forEach(banner => {
    const card = document.createElement('div'); card.classList.add('card');
    const idEl = document.createElement('p'); idEl.classList.add('id-pre'); idEl.textContent = `ID: ${banner.id || ''}`; card.appendChild(idEl);
    const titulo = document.createElement('h3'); titulo.classList.add('titulo-pre'); titulo.textContent = banner.name || banner.nombre || '';
    card.appendChild(titulo);
    if (banner.imagen_url) { const img = document.createElement('img'); img.classList.add('img-pre'); img.src = banner.imagen_url; img.alt = 'Banner'; img.style.maxWidth = '100%'; card.appendChild(img); }
    contenedor.appendChild(card);
  });
}

// Registrar formularios (si existen)
subirConImagen({ formId: 'Form-Add-Event', campos: ['title', 'start', 'end', 'description', 'type', 'location', 'coordinator', 'status'], tabla: 'Eventos', campoImagen: 'imagen_url', inputImagenId: 'archivoimg', callback: mostrardatos });
subirConImagen({ formId: 'Form-Add', campos: ['title', 'phar', 'phar2'], tabla: 'Blog', campoImagen: 'imagen_url', inputImagenId: 'archivoimg', callback: mostrardatosBlog });
subirConImagen({ formId: 'Form-Add-Banner', campos: ['name'], tabla: 'Banner', campoImagen: 'imagen_url', inputImagenId: 'banner-img', callback: mostrardatosBanner });

// Borrar (si los forms existen)
attachFormListener('Form-Delete-Blog', async function (e) {
  e.preventDefault(); if (!db) return;
  const borrarTodo = e.submitter && e.submitter.id === 'Del-All-Blog';
  if (borrarTodo) { const { error } = await db.from('Blog').delete().neq('id', 0); if (error) console.error(error); else { alert('Todos los blogs borrados'); mostrardatosBlog(); } return; }
  const id = document.getElementById('deleteIdBlog')?.value; const nombre = document.getElementById('Name-Content-Blog')?.value; if (!id || !nombre) { alert('Debes ingresar id y nombre'); return; }
  const { error } = await db.from('Blog').delete().match({ id, title: nombre }); if (error) console.error(error); else { alert('Blog borrado'); mostrardatosBlog(); }
});

attachFormListener('Form-Delete-Banner', async function (e) {
  e.preventDefault(); if (!db) return;
  const borrarTodo = e.submitter && e.submitter.id === 'Del-All-Banner';
  if (borrarTodo) { const { error } = await db.from('Banner').delete().neq('id', 0); if (error) console.error(error); else { alert('Todos los banners borrados'); mostrardatosBanner(); } return; }
  const id = document.getElementById('deleteBannerId')?.value; const nombre = document.getElementById('deleteBannerName')?.value; if (!id || !nombre) { alert('Debes ingresar id y nombre'); return; }
  const { error } = await db.from('Banner').delete().match({ id, nombre: nombre }); if (error) console.error(error); else { alert('Banner borrado'); mostrardatosBanner(); }
});

