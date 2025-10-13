// Inicialización Supabase desde instancia global
const supabase = window.supabaseInstance;
const db = supabase || window.supabaseInstance;

let carrusel;
let dotsContainer;

async function fetchBanners() {
  try {
    if (!db) {
      console.error("Supabase no inicializado: db es null");
      return [];
    }

    // Consulta a la tabla "Banner"
    const { data: banners, error } = await db.from("Banner").select("*");
    if (error) {
      console.error("Error obteniendo banners:", error);
      return [];
    }

    console.log("Respuesta Supabase:", banners);
    return banners;
  } catch (err) {
    console.error("Excepción obteniendo banners:", err);
    return [];
  }
}

function buildCarouselFromBanners(banners) {
  if (!carrusel || !dotsContainer) return;

  // Limpiar carrusel y puntos
  carrusel.innerHTML = "";
  dotsContainer.innerHTML = "";

  // Filtrar banners válidos y limitar a 4
  const validBanners = banners
    .filter(b => b && typeof b.imagen_url === "string" && b.imagen_url.trim())
    .slice(0, 4);

  if (validBanners.length === 0) {
    // Fallback visual si no hay banners
    const fallback = document.createElement("div");
    fallback.className = "noticia active";
    fallback.style.backgroundImage = "url('../assets/img/Blog-Template/15_septiembre.jpg')";
    fallback.style.backgroundSize = "cover";
    fallback.style.backgroundPosition = "center";
    fallback.style.backgroundRepeat = "no-repeat";
    carrusel.appendChild(fallback);
    return;
  }

  validBanners.forEach((b, i) => {
    const slide = document.createElement("div");
    slide.className = "noticia";
    slide.dataset.id = String(b.id ?? "");
    slide.style.background = "none";
    slide.style.backgroundImage = `url('${b.imagen_url}')`;
    slide.style.backgroundSize = "cover";
    slide.style.backgroundPosition = "center";
    slide.style.backgroundRepeat = "no-repeat";
    if (i === 0) slide.classList.add("active");
    carrusel.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "dot-noticia";
    if (i === 0) dot.classList.add("active");
    dotsContainer.appendChild(dot);
  });
}

function initCarouselBehavior() {
  if (!carrusel || !dotsContainer) return;

  const dots = dotsContainer.querySelectorAll(".dot-noticia");
  let index = 0;
  const total = dots.length;
  let autoplay;

  function mostrarNoticia(i) {
    const slides = carrusel.querySelectorAll(".noticia");

    // Limpiar clases activas
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    // Activar slide y punto correspondiente
    if (slides[i]) slides[i].classList.add("active");
    if (dots[i]) dots[i].classList.add("active");

    index = i;

    // Reiniciar autoplay
    clearInterval(autoplay);
    autoplay = setInterval(() => {
      const next = (index + 1) % total;
      mostrarNoticia(next);
    }, 8000);
  }

  // Eventos de clic en los puntos
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => mostrarNoticia(i));
  });

  // Iniciar carrusel
  if (total > 0) {
    mostrarNoticia(0);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  carrusel = document.querySelector(".noticias-carrusel");
  dotsContainer = document.querySelector(".dot-cont");

  const banners = await fetchBanners();
  console.log("Banners cargados:", banners.length, banners);

  buildCarouselFromBanners(banners);
  initCarouselBehavior();
});