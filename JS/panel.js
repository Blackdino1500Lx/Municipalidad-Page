// panel.js

// Verifica que la instancia de Supabase esté disponible globalmente
const supabase = window.supabaseInstance;
const db = supabase || window.supabaseInstance;

// 🧩 Función para adjuntar eventos submit a formularios
function attachFormListener(formId, handler) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", handler);
}

// 🧩 Función principal con soporte para subir datos e imagen/galería
function subirConImagen({ formId, campos, tabla, campoImagen = "imagen_url", inputImagenId = "archivoimg", callback }) {
    attachFormListener(formId, async function (e) {
        e.preventDefault();
        if (!db) {
            alert("Supabase no inicializado");
            return;
        }

        const form = e.currentTarget;
        const datos = {};

        // 1. Recoger datos de los campos Y APLICAR CORRECCIÓN DE ZONA HORARIA PARA EVENTOS
        for (const campo of campos) {
            const input = form.querySelector(`#${campo}, [name="${campo}"]`);
            let valor = input ? input.value : "";

            // ⭐ CORRECCIÓN DE FECHA/ZONA HORARIA PARA CAMPOS 'start' y 'end' ⭐
            // Si el campo es 'start' o 'end' y solo contiene la fecha (YYYY-MM-DD),
            // le añadimos el mediodía ('T12:00:00'). Esto asegura que el desfase de 
            // la base de datos a UTC no mueva la fecha al día anterior.
            if ((campo === 'start' || campo === 'end') && valor && tabla === "Eventos") {
                // Si el valor es solo YYYY-MM-DD
                if (valor.length === 10 && !valor.includes('T')) {
                    valor = valor + 'T12:00:00'; 
                }
                // Si ya incluye tiempo (datetime-local), no se necesita el 'T12:00:00'
                // en su lugar, se podría ajustar el string para que se guarde localmente, 
                // pero añadir la hora central es la solución más simple para el desfase diario.
            }
            // ⭐ FIN CORRECCIÓN DE FECHA ⭐

            datos[campo] = valor;
        }

        // 2. Subir imagen principal
        const fileInput = form.querySelector(`#${inputImagenId}, [name="${inputImagenId}"]`);
        const archivo = fileInput?.files?.[0];
        let imagen_url = "";

        if (archivo) {
            const fileName = `${Date.now()}_${archivo.name}`;
            // Nota: Se asume que el bucket es 'img'
            const { error: uploadError } = await db.storage.from("img").upload(fileName, archivo);
            if (uploadError) {
                console.error("Error subiendo imagen principal:", uploadError);
                alert("Error al subir imagen principal");
                return;
            }
            // URL Pública - ¡RECUERDA REEMPLAZAR LA URL DEL PROYECTO SI ES NECESARIO!
            imagen_url = `https://fexilgbdtdhsziincyxn.supabase.co/storage/v1/object/public/img/${fileName}`;
        }

        datos[campoImagen] = imagen_url;

        // 3. Insertar en tabla principal
        const { data: insertado, error } = await db.from(tabla).insert([datos]).select().single();
        if (error) {
            console.error("Error guardando datos principales:", error);
            alert("Error guardando datos principales");
            return;
        }

        // 4. Subir galería si es Blog
        if (tabla === "Blog") {
            const galeriaInput = form.querySelector("#galeria_blog");
            const archivosGaleria = galeriaInput?.files;

            if (archivosGaleria && archivosGaleria.length > 0) {
                for (let i = 0; i < archivosGaleria.length; i++) {
                    const archivoGaleria = archivosGaleria[i];
                    const nombreArchivo = `galeria/${insertado.id}_${Date.now()}_${archivoGaleria.name}`;

                    const { error: galeriaError } = await db.storage.from("img").upload(nombreArchivo, archivoGaleria);
                    if (galeriaError) {
                        console.error("Error subiendo imagen de galería:", galeriaError);
                        // No se interrumpe, solo se salta esta imagen
                        continue;
                    }

                    // Obtener URL pública de la imagen de galería
                    const { data: publicUrl } = db.storage.from("img").getPublicUrl(nombreArchivo);

                    // Insertar metadatos de la imagen de galería
                    await db.from("blog_magenes").insert({ // POSIBLE ERROR TIPOGRÁFICO: ¿Debería ser 'blog_imagenes'?
                        blog_id: insertado.id,
                        imagen_url: publicUrl.publicUrl,
                        orden: i
                    });
                }
            }
        }

        alert("Guardado correctamente");
        form.reset(); // Limpiar el formulario después de guardar
        if (typeof callback === "function") callback();
    });
}

// ------------------------------------------
//  FUNCIONES DE REGISTRO/INSERCIÓN
// ------------------------------------------

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

// ====================================================================
// 🗑️ LÓGICA DE ELIMINACIÓN
// ====================================================================

// 🧩 Función para manejar la eliminación de un solo registro
async function eliminarRegistro(tabla, campo, valor) {
    if (!db) {
        alert("Supabase no inicializado.");
        return { error: { message: "Supabase no inicializado." } };
    }

    // Asegura que el valor no sea una cadena vacía
    if (!valor) {
        alert("El valor de eliminación no puede estar vacío.");
        return { error: { message: "Valor vacío" } };
    }

    const { error } = await db.from(tabla).delete().eq(campo, valor);

    if (error) {
        console.error(`Error al borrar ${tabla} por ${campo}='${valor}':`, error);
        alert(`Error al borrar el registro de ${tabla}.`);
    } else {
        alert("Registro borrado correctamente.");
    }

    return { error };
}

// 🧩 Función para manejar el borrado de TODOS los registros
async function eliminarTodos(tabla) {
    if (!db) {
        alert("Supabase no inicializado.");
        return false;
    }

    if (!confirm(`¡ADVERTENCIA! ¿Estás seguro de que quieres borrar TODOS los registros de la tabla '${tabla}'? Esta acción es irreversible.`)) {
        return false;
    }

    // Borra todos los registros (asumiendo RLS permite esta operación)
    const { error } = await db.from(tabla).delete().neq("id", 0);

    if (error) {
        console.error(`Error al borrar TODOS los registros de ${tabla}:`, error);
        alert(`Error al borrar TODOS los registros de ${tabla}.`);
    } else {
        alert(`Todos los registros de ${tabla} borrados correctamente.`);
    }

    return !error;
}

// --- Manejadores de Borrado de Eventos ---
document.getElementById("Form-Delete-Event")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.currentTarget;
    const id = form.querySelector("#deleteId").value.trim();
    const name = form.querySelector("#Name-Content").value.trim();

    if (id) {
        const { error } = await eliminarRegistro("Eventos", "id", id);
        if (!error) mostrardatos();
    } else if (name) {
        const { error } = await eliminarRegistro("Eventos", "title", name);
        if (!error) mostrardatos();
    } else {
        alert("Ingresa un ID o Nombre de Evento para borrar.");
    }
});

document.getElementById("Del-All-Event")?.addEventListener("click", async function (e) {
    e.preventDefault();
    const borradoExitoso = await eliminarTodos("Eventos");
    if (borradoExitoso) mostrardatos();
});

// --- Manejadores de Borrado de Blogs ---
document.getElementById("Form-Delete-Blog")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.currentTarget;
    const id = form.querySelector("#deleteIdBlog").value.trim();
    const name = form.querySelector("#Name-Content-Blog").value.trim();

    if (id) {
        const { error } = await eliminarRegistro("Blog", "id", id);
        if (!error) mostrardatosBlog();
    } else if (name) {
        const { error } = await eliminarRegistro("Blog", "title", name);
        if (!error) mostrardatosBlog();
    } else {
        alert("Ingresa un ID o Nombre de Blog para borrar.");
    }
});

document.getElementById("Del-All-Blog")?.addEventListener("click", async function (e) {
    e.preventDefault();
    const borradoExitoso = await eliminarTodos("Blog");
    if (borradoExitoso) mostrardatosBlog();
});

// --- Manejadores de Borrado de Banners ---
document.getElementById("Form-Delete-Banner")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.currentTarget;
    const id = form.querySelector("#deleteBannerId").value.trim();
    const name = form.querySelector("#deleteBannerName").value.trim();

    if (id) {
        const { error } = await eliminarRegistro("Banner", "id", id);
        if (!error) mostrardatosBanner();
    } else if (name) {
        const { error } = await eliminarRegistro("Banner", "name", name);
        if (!error) mostrardatosBanner();
    } else {
        alert("Ingresa un ID o Nombre de Banner para borrar.");
    }
});

document.getElementById("Del-All-Banner")?.addEventListener("click", async function (e) {
    e.preventDefault();
    const borradoExitoso = await eliminarTodos("Banner");
    if (borradoExitoso) mostrardatosBanner();
});


// ====================================================================
// 🧾 FUNCIONES PARA MOSTRAR DATOS EN EL PANEL (PREVIEW CORREGIDO)
// ====================================================================

export async function mostrardatos() {
    window.mostrardatos = mostrardatos;
    if (!db) return;
    const { data, error } = await db.from("Eventos").select("*");
    if (error) return console.error("Error obteniendo eventos:", error);

    const contenedor = document.getElementById("preview");
    if (!contenedor) return; // Se detiene si el div#preview no existe
    contenedor.innerHTML = "";

    data.forEach((evento) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <p class="id-pre">ID: ${evento.id || ""}</p>
            <h3 class="titulo-pre">${evento.title || ""}</h3>
            ${evento.imagen_url ? `<img class="img-pre" src="${evento.imagen_url}" alt="Imagen" />` : ""}
            <div class="card-details">
                <p><strong>Inicio:</strong> ${evento.start || ""}</p>
                <p><strong>Fin:</strong> ${evento.end || ""}</p>
                <p><strong>Descripción:</strong> ${evento.description || ""}</p>
                <p><strong>Tipo:</strong> ${evento.type || ""}</p>
                <p><strong>Ubicación:</strong> ${evento.location || ""}</p>
                <p><strong>Coordinador:</strong> ${evento.coordinator || ""}</p>
                <p><strong>Estado:</strong> ${evento.status || ""}</p>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

export async function mostrardatosBlog() {
    window.mostrardatosBlog = mostrardatosBlog;
    if (!db) return;
    const { data, error } = await db.from("Blog").select("*");
    if (error) return console.error("Error obteniendo blogs:", error);

    const contenedor = document.getElementById("preview");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    data.forEach((blog) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <p class="id-pre">ID: ${blog.id || ""}</p>
            <h3 class="titulo-pre">${blog.title || blog.titulo || ""}</h3>
            ${blog.imagen_url ? `<img class="img-pre" src="${blog.imagen_url}" alt="Imagen" />` : ""}
            <div class="card-details">
                <p><strong>Texto 1:</strong> ${blog.phar || blog.parrafo || ""}</p>
                <p><strong>Texto 2:</strong> ${blog.phar2 || blog.texto2 || ""}</p>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

export async function mostrardatosBanner() {
    window.mostrardatosBanner = mostrardatosBanner;
    if (!db) return;
    const { data, error } = await db.from("Banner").select("*");
    if (error) return console.error("Error obteniendo banners:", error);

    const contenedor = document.getElementById("preview");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    data.forEach((banner) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <p class="id-pre">ID: ${banner.id || ""}</p>
            <h3 class="titulo-pre">${banner.name || banner.nombre || ""}</h3>
            ${banner.imagen_url ? `<img class="img-pre" src="${banner.imagen_url}" alt="Banner" />` : ""}
        `;
        contenedor.appendChild(card);
    });
}