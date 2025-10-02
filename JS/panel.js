//Uso de funcion Supabase
const supabase = window.supabaseInstance;

//Agregar Eventos a la Base de Datos
//Obtener Datos del Formulario


/**
 * Función reutilizable para subir datos con imagen a Supabase.
 * Se usa para los formularios de eventos, blogs y banners.
 * @param {Object} options - Configuración de la función
 * @param {string} options.formId - ID del formulario en el HTML
 * @param {Array<string>} options.campos - Lista de IDs de los campos a guardar
 * @param {string} options.tabla - Nombre de la tabla en Supabase
 * @param {string} [options.campoImagen] - Nombre del campo para la URL de la imagen (default: 'imagen_url')
 * @param {string} [options.inputImagenId] - ID del input file para la imagen (default: 'archivoimg')
 * @param {function} [options.callback] - Función a ejecutar después de guardar (ej: refrescar preview)
 */
async function subirConImagen({ formId, campos, tabla, campoImagen = 'imagen_url', inputImagenId = 'archivoimg', callback }) {
    // Escucha el submit del formulario indicado
    document.getElementById(formId).addEventListener('submit', async function(e) {
        e.preventDefault();
        // 1. Obtener valores de los campos del formulario
        let datos = {};
        for (const campo of campos) {
            const input = document.getElementById(campo);
            if (!input) {
                console.error(`No se encontró el input con id '${campo}' en el formulario '${formId}'`);
                alert(`No se encontró el input con id '${campo}' en el formulario '${formId}'`);
                return;
            }
            datos[campo] = input.value;
        }
        // 2. Subir imagen al storage de Supabase si existe
        const archivoimg = document.getElementById(inputImagenId);
        const archivo = archivoimg && archivoimg.files[0];
        let imagen_url = '';
        let nombreArchivoimg = null;
        if (archivo) {
            // Genera nombre único y sube la imagen
            const fileName = `${Date.now()}_${archivo.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('img').upload(fileName, archivo);
            if (uploadError) {
                console.error('Error subiendo imagen:', uploadError);
                alert('Error al subir la imagen');
                return;
            }
            nombreArchivoimg = fileName;
            imagen_url = `https://fexilgbdtdhsziincyxn.supabase.co/storage/v1/object/public/img/${nombreArchivoimg}`;
        }
        // 3. Agrega la URL de la imagen al objeto de datos
        datos[campoImagen] = imagen_url;
        // 4. Inserta los datos en la tabla correspondiente
        const { error } = await supabase.from(tabla).insert([datos]);
        if (error) {
            console.error("Error guardando:", error);
            alert("Error guardando los datos");
        } else {
            alert("Elementos guardados correctamente");
            // 5. Ejecuta el callback para refrescar el preview si se indicó
            if (typeof callback === 'function') callback();
        }
    });
}

// Usar para eventos
subirConImagen({
    formId: 'Form-Add-Event',
    campos: ['title', 'start', 'end', 'description', 'type', 'location', 'coordinator', 'status'],
    tabla: 'Eventos',
    campoImagen: 'imagen_url',
    inputImagenId: 'archivoimg',
    callback: mostrardatos
});

// Usar para blogs
subirConImagen({
    formId: 'Form-Add',
    campos: ['title', 'phar', 'phar2'],
    tabla: 'Blog',
    campoImagen: 'imagen_url',
    inputImagenId: 'archivoimg',
    callback: mostrardatosBlog
});

// Usar para banners
subirConImagen({
    formId: 'Form-Add-Banner',
    campos: ['Name'],
    tabla: 'Banner',
    campoImagen: 'imagen_url',
    inputImagenId: 'banner-img',
    callback: mostrardatosBanner
});


//Funcion para mostar los datos en la seccion preview del Panel de Administracion
async function mostrardatos() {
// Hacer disponible la función en el ámbito global
window.mostrardatos = mostrardatos;
    let { data, error } = await supabase.from('Eventos').select('*');
    if (error) {
        console.error("Error obteniendo datos:", error);
        return;
    }
    // renderizado de contenido
    const contenedor = document.getElementById('preview');
    contenedor.innerHTML = "";
    data.forEach(evento => {
        const card = document.createElement('div');
        card.classList.add('card');
        // Título
        const titulo = document.createElement('h3');
        titulo.classList.add('titulo-pre');
        titulo.textContent = evento.title || '';
        card.appendChild(titulo);
        // Imagen
        if (evento.imagen_url) {
            const img = document.createElement('img');
            img.classList.add('img-pre');
            img.src = evento.imagen_url;
            img.alt = 'Imagen';
            img.style.maxWidth = '100%';
            card.appendChild(img);
        }
        // Fechas
        const fechas = document.createElement('p');
    fechas.textContent = `Inicio: ${evento.start || ''} | Fin: ${evento.end || ''}`;
        card.appendChild(fechas);
        // Descripción
        const descripcion = document.createElement('p');
    descripcion.textContent = `Descripción: ${evento.description || ''}`;
        card.appendChild(descripcion);
        // Tipo
        const tipo = document.createElement('p');
    tipo.textContent = `Tipo: ${evento.type || ''}`;
        card.appendChild(tipo);
        // Ubicación
        const ubicacion = document.createElement('p');
    ubicacion.textContent = `Ubicación: ${evento.location || ''}`;
        card.appendChild(ubicacion);
        // Coordinador
        const coordinador = document.createElement('p');
    coordinador.textContent = `Coordinador: ${evento.coordinator || ''}`;
        card.appendChild(coordinador);
        // Estado
        const estado = document.createElement('p');
    estado.textContent = `Estado: ${evento.status || ''}`;
        card.appendChild(estado);
        // Añadir la card al contenedor
        contenedor.appendChild(card);
    });
}

//Funcion para procesar el archivo excel y que los datos se guarden dentro de la BASE DE DATOS 
async function procesarExcel() {
    const input = document.getElementById('archivoExcel');
    const file = input.files[0];
    if (!file) {
        alert('Selecciona un archivo Excel primero.');
        return;
    }
    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        // Guardar cada fila en la base de datos
        for (const fila of jsonData) {
            const { titulo, parrafo, texto2, } = fila;
            // Si los nombres de columna son diferentes, ajusta aquí
            await supabase.from('entradas').insert([
                {
                    titulo:titulo || '',
                    parrafo: parrafo || '',
                    texto2: texto2 || '',
                }
            ]);
        }
        // Actualizar el preview
        mostrardatos();
        alert('Datos importados correctamente');
    };
    reader.readAsArrayBuffer(file);
}

window.procesarExcel = procesarExcel;
window.mostrardatosPublico = mostrardatos;

// No mostrar preview por defecto, solo cuando se selecciona el tipo


//Funcion de eliminar datos 


// --- FUNCIONES DE PREVIEW ---
async function mostrardatosBlog() {
    window.mostrardatosBlog = mostrardatosBlog;
    let { data, error } = await supabase.from('Blog').select('*');
    if (error) {
        console.error("Error obteniendo blogs:", error);
        return;
    }
    const contenedor = document.getElementById('preview');
    contenedor.innerHTML = "";
    data.forEach(blog => {
        const card = document.createElement('div');
        card.classList.add('card');
        const titulo = document.createElement('h3');
        titulo.classList.add('titulo-pre');
    titulo.textContent = blog.title || '';
        card.appendChild(titulo);
        if (blog.imagen_url) {
            const img = document.createElement('img');
            img.classList.add('img-pre');
            img.src = blog.imagen_url;
            img.alt = 'Imagen';
            img.style.maxWidth = '100%';
            card.appendChild(img);
        }
        const texto1 = document.createElement('p');
        texto1.classList.add('text1');
    texto1.textContent = `Texto 1: ${blog.phar || ''}`;
        card.appendChild(texto1);
        const texto2 = document.createElement('p');
        texto2.classList.add('text2');
    texto2.textContent = `Texto 2: ${blog.phar2 || ''}`;
        card.appendChild(texto2);
        contenedor.appendChild(card);
    });
}

async function mostrardatosBanner() {
    window.mostrardatosBanner = mostrardatosBanner;
    let { data, error } = await supabase.from('Banner').select('*');
    if (error) {
        console.error("Error obteniendo banner:", error);
        return;
    }
    const contenedor = document.getElementById('preview');
    contenedor.innerHTML = "";
    data.forEach(banner => {
        const card = document.createElement('div');
        card.classList.add('card');
        const titulo = document.createElement('h3');
        titulo.classList.add('titulo-pre');
    titulo.textContent = banner.name || '';
        card.appendChild(titulo);
        if (banner.imagen_url) {
            const img = document.createElement('img');
            img.classList.add('img-pre');
            img.src = banner.imagen_url;
            img.alt = 'Banner';
            img.style.maxWidth = '100%';
            card.appendChild(img);
        }
        contenedor.appendChild(card);
    });
}

// Usar para eventos
subirConImagen({
    formId: 'Form-Add-Event',
    campos: ['title', 'Ini-Date', 'End-Date', 'Description', 'type', 'Location', 'Coordinator', 'status'],
    tabla: 'Eventos',
    campoImagen: 'imagen_url',
    inputImagenId: 'archivoimg',
    callback: mostrardatos
});

// Usar para blogs
subirConImagen({
    formId: 'Form-Add',
    campos: ['title', 'phar', 'phar2'],
    tabla: 'Blog',
    campoImagen: 'imagen_url',
    inputImagenId: 'archivoimg',
    callback: mostrardatosBlog
});

// Usar para banners
subirConImagen({
    formId: 'Form-Add-Banner',
    campos: ['name'],
    tabla: 'Banner',
    campoImagen: 'imagen_url',
    inputImagenId: 'banner-img',
    callback: mostrardatosBanner
});
    // ...existing code...

// Eliminar Blog
document.getElementById('Form-Delete-Blog').addEventListener('submit', async function(e) {
    e.preventDefault();
    const borrarTodo = e.submitter && e.submitter.id === 'Del-All-Blog';
    if (borrarTodo) {
        const { error } = await supabase.from('Blog').delete().neq('id', 0);
        if (error) {
            alert('Error borrando todos los blogs');
            console.error(error);
        } else {
            alert('Todos los blogs borrados correctamente');
            mostrardatosBlog();
        }
        return;
    }
    const id = document.getElementById('deleteIdBlog').value;
    const nombre = document.getElementById('Name-Content-Blog').value;
    if (!id || !nombre) {
        alert('Debes ingresar el id y el nombre del blog.');
        return;
    }
    const { error } = await supabase
        .from('Blog')
        .delete()
        .match({ id, titulo: nombre });
    if (error) {
        alert('Error borrando el blog');
        console.error(error);
    } else {
        alert('Blog borrado correctamente');
        mostrardatosBlog();
    }
});

// Eliminar Banner
document.getElementById('Form-Delete-Banner').addEventListener('submit', async function(e) {
    e.preventDefault();
    const borrarTodo = e.submitter && e.submitter.id === 'Del-All-Banner';
    if (borrarTodo) {
        const { error } = await supabase.from('Banner').delete().neq('id', 0);
        if (error) {
            alert('Error borrando todos los banners');
            console.error(error);
        } else {
            alert('Todos los banners borrados correctamente');
            mostrardatosBanner();
        }
        return;
    }
    const id = document.getElementById('deleteBannerId').value;
    const nombre = document.getElementById('deleteBannerName').value;
    if (!id || !nombre) {
        alert('Debes ingresar el id y el nombre del banner.');
        return;
    }
    const { error } = await supabase
        .from('Banner')
        .delete()
        .match({ id, nombre: nombre });
    if (error) {
        alert('Error borrando el banner');
        console.error(error);
    } else {
        alert('Banner borrado correctamente');
        mostrardatosBanner();
// Mostrar blogs en preview
async function mostrardatosBlog() {
// Hacer disponible la función en el ámbito global inmediatamente después de definirla
window.mostrardatosBlog = mostrardatosBlog;
    let { data, error } = await supabase.from('Blog').select('*');
    if (error) {
        console.error("Error obteniendo blogs:", error);
        return;
    }
    const contenedor = document.getElementById('preview');
    contenedor.innerHTML = "";
    data.forEach(blog => {
        const card = document.createElement('div');
        card.classList.add('card');
        const titulo = document.createElement('h3');
        titulo.classList.add('titulo-pre');
        titulo.textContent = blog.titulo || blog.h1 || '';
        card.appendChild(titulo);
        if (blog.imagen_url) {
            const img = document.createElement('img');
            img.classList.add('img-pre');
            img.src = blog.imagen_url;
            img.alt = 'Imagen';
            img.style.maxWidth = '100%';
            card.appendChild(img);
        }
        const texto1 = document.createElement('p');
        texto1.classList.add('text1');
        texto1.textContent = `Texto 1: ${blog.parrafo || blog.Phar || ''}`;
        card.appendChild(texto1);
        const texto2 = document.createElement('p');
        texto2.classList.add('text2');
        texto2.textContent = `Texto 2: ${blog.texto2 || blog.Phar2 || ''}`;
        card.appendChild(texto2);
        contenedor.appendChild(card);
    });
}

// Mostrar banners en preview
async function mostrardatosBanner() {
// Hacer disponible la función en el ámbito global
window.mostrardatosBanner = mostrardatosBanner;
    let { data, error } = await supabase.from('banners').select('*');
    if (error) {
        console.error("Error obteniendo banners:", error);
        return;
    }
    const contenedor = document.getElementById('preview');
    contenedor.innerHTML = "";
    data.forEach(banner => {
        const card = document.createElement('div');
        card.classList.add('card');
        const titulo = document.createElement('h3');
        titulo.classList.add('titulo-pre');
        titulo.textContent = banner.nombre || '';
        card.appendChild(titulo);
        if (banner.imagen_url) {
            const img = document.createElement('img');
            img.classList.add('img-pre');
            img.src = banner.imagen_url;
            img.alt = 'Banner';
            img.style.maxWidth = '100%';
            card.appendChild(img);
        }
        contenedor.appendChild(card);
    });
}
    }
});
