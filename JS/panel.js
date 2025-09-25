//Uso de funcion Supabase
const supabase = window.supabaseInstance;

//Agregar Eventos a la Base de Datos
//Obtener Datos del Formulario
document.getElementById('Form-Add').addEventListener('submit', async function(e) {
    e.preventDefault();
//cambiar nombre variables y elementos DOM. 
// <<<<REUSAR>>>>
    const titulo = document.getElementById('h1').value;
    const parrafo = document.getElementById('Phar').value;
    const texto2 = document.getElementById('Phar2').value;
    const archivoimg = document.getElementById('archivoimg');
    const archivo = archivoimg.files[0];
        let imagen_url = '';
    let nombreArchivoimg = null;

//Agregar Imagen al Storage de Supabase
    if (archivo) {
        const fileName = `${Date.now()}_${archivo.name}`;
        const { data, error: uploadError } = await supabase.storage.from('Img').upload(fileName, archivo);
        if (uploadError) {
            console.error('Error subiendo imagen:', uploadError);
            alert('Error al subir la imagen');
            return;
        }
        //Generar una url a cada imagen subida al storage de la Base de Datos, para despiues insertarla en la pagina
        nombreArchivoimg = fileName;

        // Definir la URL de la imagen subida
        //Esta URL cambia
            imagen_url = `https://fexilgbdtdhsziincyxn.supabase.co/storage/v1/object/public/Img/${nombreArchivoimg}`;
        // Mostrar la imagen en el preview (img)
        const previewImg = document.getElementById('previewImgme');
        if (previewImg && previewImg.tagName === 'IMG') {
            previewImg.src = imagen_url;
            previewImg.style.display = 'block';
        }
    }
//cambiar "entradas" por nombre de tabla de la base de datos, Ca,bair en el insert el nombre de cada una de las celdas 
    const { error } = await supabase.from('entradas').insert([{ titulo, parrafo, texto2, imagen_url }]);

    if (error) {
        console.error("Error guardando:", error);
        alert("Error guardando los datos");
    } else {
        alert("Elementos guardados correctamente");
        mostrardatos();
    }
});


//FUncion para mostar los datos en la seccion preview del Panel de Administracion
async function mostrardatos() {
    let { data, error } = await supabase.from('entradas').select('*');
// pide los datos a SUpabase mediante el anon key
    if (error) {
        console.error("Error obteniendo datos:", error);
    } else {

        // renderizado de contenido
const contenedor = document.getElementById('preview');
contenedor.innerHTML = "";

data.forEach(tema => {
    const card = document.createElement('div');
    card.classList.add('card'); // Aquí aplica la clase CSS
    const titulo = document.createElement('h3');
    titulo.classList.add('titulo-pre');
    titulo.textContent = tema.titulo || tema.h1 || '';

    const img = document.createElement('img');
    img.classList.add('img-pre');
    img.src = tema.imagen_url || '';
    img.alt = 'Imagen';
    img.style.maxWidth = '100%';

    const texto1 = document.createElement('p');
    texto1.classList.add('text1');
    texto1.textContent = `Texto 1: ${tema.parrafo || tema.Phar || ''}`;

    const texto2 = document.createElement('p');
    texto2.classList.add('text2');
    texto2.textContent = `Texto 2: ${tema.texto2 || tema.Phar2 || ''}`;

    // Añadir elementos a la card
    card.appendChild(titulo);
    if (tema.imagen_url) card.appendChild(img);
    card.appendChild(texto1);
    card.appendChild(texto2);

    // Añadir la card al contenedor
    contenedor.appendChild(card);
});

    }
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

async function mostrar(tipo) {
    let { data, error } = await supabase.from('Eventos').select('*');
    if (error) {
        console.error("Error obteniendo datos:", error);
        return;
    }
    const contenedor = document.getElementById('preview');
    contenedor.innerHTML = "";
    // Filtrar por tipo
    const filtrados = data.filter(tema => tema.tipo === tipo);
    filtrados.forEach(tema => {
        let div = document.createElement('div');
        let imgTag = tema.imagen_url ? `<img class="img-pre" src="${tema.imagen_url}" style="max-width:200px;" />` : '';
        div.innerHTML = `<h3 class="titulo-pre">${tema.titulo || tema.h1 || ''}</h3>${imgTag}
        <p class="text1">Texto 1: ${tema.parrafo || tema.Phar || ''}</p>
        <p class="text2">Texto 2: ${tema.texto2 || tema.Phar2 || ''}</p>`;
        contenedor.appendChild(div);
    });
}async function DeleteElements() {
    
}


window.procesarExcel = procesarExcel;
window.mostrar = mostrar;
window.mostrardatosPublico = mostrardatos;

mostrardatos();


//Funcion de eliminar datos 
document.getElementById('Form-Delete').addEventListener('submit', async function(e) {
  e.preventDefault();
  // Detecta qué botón fue presionado
  const borrarTodo = e.submitter && e.submitter.id === 'Del-All';
  if (borrarTodo) {
    // Borrar todos los datos
    const { error } = await supabase.from('entradas').delete().neq('id', 0);
    if (error) {
      alert('Error borrando todos los contenidos');
      console.error(error);
    } else {
      alert('Todos los contenidos borrados correctamente');
      mostrardatos();
    }
    return;
  }
  // Borrar por id y nombre
  const id = document.getElementById('deleteId').value;
  const nombre = document.getElementById('Name-Content').value;
  if (!id || !nombre) {
    alert('Debes ingresar el id y el nombre del artículo.');
    return;
  }
  const { error } = await supabase
    .from('entradas')
    .delete()
    .match({ id, titulo: nombre });
  if (error) {
    alert('Error borrando el contenido');
    console.error(error);
  } else {
    alert('Contenido borrado correctamente');
    mostrardatos();
  }
});
