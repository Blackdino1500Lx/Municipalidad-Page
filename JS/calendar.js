
//  Inicialización del calendario

document.addEventListener("DOMContentLoaded", async function () {
  // === Elementos del DOM para el calendario y el modal ===
  const calendarEl = document.getElementById("calendar");
  const overlay = document.getElementById("evento-overlay");
  const modalFecha = document.getElementById("evento-fecha");
  const modalTexto = document.getElementById("evento-texto");
  const modalImg = document.getElementById("evento-img");
  const modalUbicacion = document.getElementById("evento-ubicacion");
  const modalTipo = document.getElementById("evento-tipo");
  const modalEstado = document.getElementById("evento-estado");
  const modalCoordinador = document.getElementById("evento-coordinador");
  const cerrar = document.getElementById("evento-cerrar");

  const db = window.supabaseInstance;


  //  Obtener eventos desde Supabase
 
  async function obtenerEventos() {
  const { data, error } = await db
    .from("Eventos")
    .select(", title, start, end, description, location, type, coordinator, status, imagen_url");

  if (error) {
    console.error("Error al cargar eventos:", error);
    return [];
  }

  const coloresPorTipo = {
    cultural: "#9C27B0",
    ambiental: "#4CAF50",
    educativo: "#2196F3",
    familiar: "#FF9800",
    comercial: "#795548",
    social: "#E91E63",
    deportivo: "#F44336"
  };

  return data.map((evento) => ({
    id: evento.id,
    title: evento.title,
    start: evento.start,
    end: evento.end,
    extendedProps: {
      description: evento.description,
      location: evento.location,
      type: evento.type,
      coordinator: evento.coordinator,
      status: evento.status,
      imagen: evento.imagen_url || "../assets/img/placeholder.jpg"
    },
    color: coloresPorTipo[evento.type] || "#607D8B" // gris por defecto si no coincide
  }));
}

  const infoDias = await obtenerEventos();


  // 🗓️ Configuración de FullCalendar
 
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    firstDay: 1,
    headerToolbar: { start: "", center: "title", end: "" },
    titleFormat: { month: "long" },
    events: infoDias,

    // 📌 Clic en día sin evento
    dateClick: function (info) {
      const eventosDelDia = calendar.getEvents().filter(ev => {
        const evDate = ev.start;
        const clickedDate = info.date;
        return (
          evDate.getFullYear() === clickedDate.getFullYear() &&
          evDate.getMonth() === clickedDate.getMonth() &&
          evDate.getDate() === clickedDate.getDate()
        );
      });

      if (eventosDelDia.length > 0) return; // Si hay eventos ese día, no mostrar modal vacío

      modalFecha.textContent = "Sin eventos";
      modalTexto.textContent = "No hay información para este día.";
      modalImg.src = "../assets/img/placeholder.jpg";
      modalUbicacion.textContent = "";
      modalTipo.textContent = "";
      modalEstado.textContent = "";
      modalCoordinador.textContent = "";
      overlay.style.display = "flex";
    },

    //  Clic en evento
    eventClick: (info) => {
      const props = info.event.extendedProps;
      const eventData = info.event;

      if (props) {
        modalFecha.textContent = eventData.title || "Sin título";
        modalTexto.textContent = props.description || "Sin descripción";
        modalImg.src = props.imagen || "../assets/img/placeholder.jpg";

        modalUbicacion.textContent = `Ubicación: ${props.location || "No especificada"}`;
        modalTipo.textContent = `Tipo: ${props.type || "No definido"}`;
        modalEstado.textContent = `Estado: ${props.status || "Pendiente"}`;
        modalCoordinador.textContent = `Coordinador: ${props.coordinator || "No asignado"}`;
      }

      overlay.style.display = "flex";
    }
  });

  calendar.render();


  //  Botones de navegación mensual
  
  const monthToolbar = document.getElementById("month-toolbar");
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  meses.forEach((mes, index) => {
    const btn = document.createElement("button");
    btn.textContent = mes;
    btn.addEventListener("click", () => {
      const year = new Date().getFullYear();
      calendar.gotoDate(`${year}-${String(index + 1).padStart(2, "0")}-01`);
      actualizarActivo(index);
    });
    monthToolbar.appendChild(btn);
  });

  function actualizarActivo(mesIndex) {
    const botones = monthToolbar.querySelectorAll("button");
    botones.forEach((btn, i) => btn.classList.toggle("active", i === mesIndex));
  }

  actualizarActivo(new Date().getMonth());

  //  Cierre del modal
  
  cerrar.addEventListener("click", () => {
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", (e) => {
    if (e.target.id === "evento-overlay") {
      e.target.style.display = "none";
    }
  });
});