const carrusel = document.querySelector(".noticias-carrusel");
const dotsContainer = document.querySelector(".dot-cont");

async function fetchBanners() {
  try {
    const db = window.supabaseInstance;
    if (!db) return [];
    const { data, error } = await db
      .from("Banner")
      .select("id, imagen_url")
      .order("id", { ascending: true });
    if (error) {
      console.error("Error obteniendo banners:", error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Excepción obteniendo banners:", e);
    return [];
  }
}

function buildCarouselFromBanners(banners) {
  if (!carrusel || !dotsContainer) return;

  carrusel.innerHTML = "";
  dotsContainer.innerHTML = "";

  const validBanners = banners.filter((b) => b && b.imagen_url);
  validBanners.forEach((b, i) => {
    const slide = document.createElement("div");
    slide.className = "noticia";
    slide.dataset.id = String(b.id ?? "");
    slide.style.backgroundImage = `url('${b.imagen_url}')`;
    slide.style.backgroundSize = "cover";
    slide.style.backgroundPosition = "center";
    slide.style.backgroundRepeat = "no-repeat";
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
    dots.forEach((dot) => dot.classList.remove("active"));
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

  menu.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      burger.classList.remove("burger-activo");
      menu.classList.remove("menu-activo");
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const banners = await fetchBanners();
  console.log("Banners cargados:", banners.length, banners);
  if (banners.length > 0) {
    buildCarouselFromBanners(banners);
  }

  initCarouselBehavior();
  initBurger();
});
