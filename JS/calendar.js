document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const overlay = document.getElementById("evento-overlay");
  const modalFecha = document.getElementById("evento-fecha");
  const modalTexto = document.getElementById("evento-texto");
  const modalImg = document.getElementById("evento-img");
  const cerrar = document.getElementById("evento-cerrar");

  // Aquí defines la información de los días con evento
  const infoDias = [
    {
      id: "1",
      title: "Evento nuevo",
      start: "2025-10-08",
      color: "yellow",
      texto: "Reunión para discutir proyectos comunitarios.",
      imagen: "https://pm1.aminoapps.com/7149/056308368594c4c59e67aae94f407b434006ce6er1-480-655v2_hq.jpg",
    },
    {
      id: "2",
      title: "Festival Cultural",
      start: "2025-10-10T10:00:00",
      end: "2025-10-10T12:00:00",
      texto: "Evento especial con música y bailes típicos.",
      imagen: "../js/assets/img/eventos/festival.jpg",
    },
    {
      id: "3",
      title: "Día del Medio Ambiente",
      start: "2025-10-15",
      end: "2025-10-17",
      texto: "Actividad ecológica en el parque central.",
      imagen: "../../img/eventos/ambiente.jpg",
    },
  ];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    firstDay: 1,
    headerToolbar: { start: "", center: "title", end: "" },
    titleFormat: { month: "long" },

    events: infoDias,

    dateClick: function (info) {
      modalFecha.textContent = "Sin eventos";
      modalTexto.textContent = "No hay información para este día.";
      modalImg.src = "https://via.placeholder.com/400x200?text=Sin+evento";
      overlay.style.display = "flex";
    },

    eventClick: (info) => {
      const props = info.event.extendedProps;
      const eventData = info.event;
      if (props) {
        modalFecha.textContent = eventData.title;
        modalTexto.textContent = props.texto;
        modalImg.src = props.imagen;
      }
      overlay.style.display = "flex";
    },

    dayCellDidMount: function (info) {
      if (infoDias[info.dateStr]) {
        info.el.setAttribute("data-has-event", "true");
      }
    },
  });

  calendar.render();

  // === GENERAR BOTONES DE MESES ===
  const monthToolbar = document.getElementById("month-toolbar");
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
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

  // Cerrar modal
  cerrar.addEventListener("click", () => {
    overlay.style.display = "none";
  });
  // Cerrar al hacer clic fuera del modal
  overlay.addEventListener("click", (e) => {
    if (e.target.id === "evento-overlay") {
      e.target.style.display = "none";
    }
  });
});
