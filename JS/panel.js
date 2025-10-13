
// Inicialización de Supabase

const supabase = window.supabaseInstance;
const db = supabase || window.supabaseInstance;


// 🧩 Función para adjuntar eventos submit

function attachFormListener(formId, handler) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", handler);
}


//  Subir datos con imagen (eventos, blogs, banners)

function subirConImagen({ formId, campos, tabla, campoImagen = "imagen_url", inputImagenId = "archivoimg", callback }) {
  attachFormListener(formId, async function (e) {
    e.preventDefault();
    if (!db) {
      alert("Supabase no inicializado");
      return;
    }

    const form = e.currentTarget;
    const datos = {};
    for (const campo of campos) {
      const input = form.querySelector(`#${campo}, [name="${campo}"]`);
      datos[campo] = input ? input.value : "";
    }

    const fileInput = form.querySelector(`#${inputImagenId}, [name="${inputImagenId}"]`);
    const archivo = fileInput?.files?.[0];
    let imagen_url = "";
    if (archivo) {
      const fileName = `${Date.now()}_${archivo.name}`;
      const { data: _upload, error: uploadError } = await db.storage.from("img").upload(fileName, archivo);
      if (uploadError) {
        console.error("Error subiendo imagen:", uploadError);
        alert("Error al subir imagen");
        return;
      }
      imagen_url = `https://fexilgbdtdhsziincyxn.supabase.co/storage/v1/object/public/img/${fileName}`;
    }

    datos[campoImagen] = imagen_url;
    const { error } = await db.from(tabla).insert([datos]);
    if (error) {
      console.error("Error guardando:", error);
      alert("Error guardando datos");
      return;
    }

    alert("Guardado correctamente");
    if (typeof callback === "function") callback();
  });
}

// Mostrar eventos en el panel

export async function mostrardatos() {
  window.mostrardatos = mostrardatos;
  if (!db) return;
  const { data, error } = await db.from("Eventos").select("*");
  if (error) {
    console.error("Error obteniendo eventos:", error);
    return;
  }

  const contenedor = document.getElementById("preview");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  data.forEach((evento) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <p class="id-pre">ID: ${evento.id || ""}</p>
      <h1 class="titulo-pre">${evento.title || ""}</h1>
      ${evento.imagen_url ? `<img class="img-pre" src="${evento.imagen_url}" alt="Imagen" style="max-width: 100%;" />` : ""}
      <p>Inicio: ${evento.start || ""} | Fin: ${evento.end || ""}</p>
      <p>Descripción: ${evento.description || ""}</p>
      <p>Tipo: ${evento.type || ""}</p>
      <p>Ubicación: ${evento.location || ""}</p>
      <p>Coordinador: ${evento.coordinator || ""}</p>
      <p>Estado: ${evento.status || ""}</p>
    `;

    contenedor.appendChild(card);
  });
}


//  Procesar archivo Excel

export async function procesarExcel() {
  const input = document.getElementById("archivoExcel");
  if (!input || !input.files || !input.files[0]) {
    alert("Selecciona un archivo Excel primero.");
    return;
  }
  if (!window.XLSX) {
    alert("La librería XLSX no está cargada.");
    return;
  }

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = window.XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = window.XLSX.utils.sheet_to_json(worksheet);

    for (const fila of jsonData) {
      const { titulo, parrafo, texto2 } = fila;
      await db.from("entradas").insert([{ titulo: titulo || "", parrafo: parrafo || "", texto2: texto2 || "" }]);
    }

    if (typeof mostrardatos === "function") mostrardatos();
    alert("Datos importados correctamente");
  };
  reader.readAsArrayBuffer(file);
}
window.procesarExcel = procesarExcel;


// Mostrar blogs en el panel

export async function mostrardatosBlog() {
  window.mostrardatosBlog = mostrardatosBlog;
  if (!db) return;
  const { data, error } = await db.from("Blog").select("*");
  if (error) {
    console.error("Error obteniendo blogs:", error);
    return;
  }

  const contenedor = document.getElementById("preview");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  data.forEach((blog) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <p class="id-pre">ID: ${blog.id || ""}</p>
      <h3 class="titulo-pre">${blog.title || blog.titulo || ""}</h3>
      ${blog.imagen_url ? `<img class="img-pre" src="${blog.imagen_url}" alt="Imagen" style="max-width: 100%;" />` : ""}
      <p class="text1">Texto 1: ${blog.phar || blog.parrafo || ""}</p>
      <p class="text2">Texto 2: ${blog.phar2 || blog.texto2 || ""}</p>
    `;

    contenedor.appendChild(card);
  });
}

// 🖼️ Mostrar banners en el panel

export async function mostrardatosBanner() {
  window.mostrardatosBanner = mostrardatosBanner;
  if (!db) return;
  const { data, error } = await db.from("Banner").select("*");
  if (error) {
    console.error("Error obteniendo banners:", error);
    return;
  }

  const contenedor = document.getElementById("preview");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  data.forEach((banner) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <p class="id-pre">ID: ${banner.id || ""}</p>
      <h3 class="titulo-pre">${banner.name || banner.nombre || ""}</h3>
      ${banner.imagen_url ? `<img class="img-pre" src="${banner.imagen_url}" alt="Banner" style="max-width: 100%;" />` : ""}
    `;

    contenedor.appendChild(card);
  });
}


// 🧾 Registro de formularios

subirConImagen({
  formId: "Form-Add-Event",
  campos: ["title", "start", "end", "description", "type", "location", "coordinator", "status"],
  tabla: "Eventos",
  campoImagen: "imagen_url",
  inputImagenId: "archivoimg",
  callback: mostrardatos,
});

subirConImagen({
  formId: "Form-Add",
  campos: ["title", "phar", "phar2"],
  tabla: "Blog",
  campoImagen: "imagen_url",
  inputImagenId: "archivoimg_blog",
  callback: mostrardatosBlog,
});

subirConImagen({
  formId: "Form-Add-Banner",
  campos: ["name"],
  tabla: "Banner",
  campoImagen: "imagen_url",
  inputImagenId: "banner-img",
  callback: mostrardatosBanner,
});

// 🗑️ Borrar eventos (uno o todos)

    attachFormListener("Form-Delete-Event", async function (e) {
  e.preventDefault();
  if (!db) return;

  const borrarTodo = e.submitter && e.submitter.id === "Del-All-Event";
  if (borrarTodo) {
    const confirmar = confirm("¿Estás seguro de que deseas borrar TODOS los eventos?");
    if (!confirmar) return;

    const { error } = await db.from("Eventos").delete().neq("id", 0);
    if (error) console.error("Error borrando todos los eventos:", error);
    else {
      alert("Todos los eventos borrados");
      mostrardatos();
    }
    return;
  }

  const id = document.getElementById("deleteId")?.value;
  const nombre = document.getElementById("Name-Content")?.value;
  if (!id || !nombre) {
    alert("Debes ingresar id y nombre");
    return;
  }

  const { error } = await db.from("Eventos").delete().match({ id, title: nombre });
  if (error) console.error("Error borrando evento:", error);
  else {
    alert("Evento borrado");
    mostrardatos();
  }
});

// Borrar blog (uno o todos)
attachFormListener("Form-Delete-Blog", async function (e) {
  e.preventDefault();
  if (!db) return;

  const borrarTodo = e.submitter && e.submitter.id === "Del-All-Blog";
  if (borrarTodo) {
    const confirmar = confirm("¿Estás seguro de que deseas borrar TODOS los blogs?");
    if (!confirmar) return;

    const { error } = await db.from("Blog").delete().neq("id", 0);
    if (error) console.error("Error borrando todos los blogs:", error);
    else {
      alert("Todos los blogs borrados");
      mostrardatosBlog();
    }
    return;
  }

  const id = document.getElementById("deleteIdBlog")?.value;
  const nombre = document.getElementById("Name-Content-Blog")?.value;
  if (!id || !nombre) {
    alert("Debes ingresar id y nombre");
    return;
  }

  const { error } = await db.from("Blog").delete().match({ id, title: nombre });
  if (error) console.error("Error borrando blog:", error);
  else {
    alert("Blog borrado");
    mostrardatosBlog();
  }
});

// Borrar banners (uno o todos)
attachFormListener("Form-Delete-Banner", async function (e) {
  e.preventDefault();
  if (!db) return;

  const borrarTodo = e.submitter && e.submitter.id === "Del-All-Banner";
  if (borrarTodo) {
    const confirmar = confirm("¿Estás seguro de que deseas borrar TODOS los banners?");
    if (!confirmar) return;

    const { error } = await db.from("Banner").delete().neq("id", 0);
    if (error) console.error("Error borrando todos los banners:", error);
    else {
      alert("Todos los banners borrados");
      mostrardatosBanner();
    }
    return;
  }

  const id = document.getElementById("deleteBannerId")?.value;
  const nombre = document.getElementById("deleteBannerName")?.value;
  if (!id || !nombre) {
    alert("Debes ingresar id y nombre");
    return;
  }

  const { error } = await db.from("Banner").delete().match({ id, name: nombre });
  if (error) console.error("Error borrando banner:", error);
  else {
    alert("Banner borrado");
    mostrardatosBanner();
  }
});