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

  // Limpiar carrusel y dots
  carrusel.innerHTML = "";
  dotsContainer.innerHTML = "";

  // Filtrar banners válidos y limitar a 4
  const validBanners = banners
    .filter(b => b && typeof b.imagen_url === "string" && b.imagen_url.trim())
    .slice(0, 4);

  if (validBanners.length === 0) {
    // Fallback visual si no hay banners
    const fallback = document.createElement("div");
    fallback.className = "noticia";
    fallback.style.backgroundImage = "url('../assets/img/Escuela.png')";
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
    slide.style.background = "none"; // Elimina fondo gris heredado
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

  carrusel.style.transform = "translateX(0%)";
}

function initCarouselBehavior() {
  if (!carrusel || !dotsContainer) return;

  const dots = dotsContainer.querySelectorAll(".dot-noticia");
  let index = 0;
  const total = dots.length;

  function mostrarNoticia(i) {
    carrusel.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach(dot => dot.classList.remove("active"));
    if (dots[i]) dots[i].classList.add("active");
    index = i;
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => mostrarNoticia(i));
  });

  if (total > 0) {
    mostrarNoticia(0);
    setInterval(() => {
      const next = (index + 1) % total;
      mostrarNoticia(next);
    }, 8000);
  }
}

function initBurger() {
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".menu");
  if (!burger || !menu) return;

  burger.classList.remove("burger-activo");
  menu.classList.remove("menu-activo");

  burger.addEventListener("click", () => {
    burger.classList.toggle("burger-activo");
    menu.classList.toggle("menu-activo");
  });

  menu.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", () => {
      burger.classList.remove("burger-activo");
      menu.classList.remove("menu-activo");
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  carrusel = document.querySelector(".noticias-carrusel");
  dotsContainer = document.querySelector(".dot-cont");

  const banners = await fetchBanners();
  console.log("Banners cargados:", banners.length, banners);

  buildCarouselFromBanners(banners);
  initCarouselBehavior();
  initBurger();
});