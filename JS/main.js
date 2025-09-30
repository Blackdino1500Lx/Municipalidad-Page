const carrusel = document.querySelector(".noticias-carrusel");
const dots = document.querySelectorAll(".dot-noticia");
let index = 0;
let total = dots.length;

// función para mostrar noticia
function mostrarNoticia(i) {
  carrusel.style.transform = `translateX(-${i * 100}%)`;
  dots.forEach(dot => dot.classList.remove("active"));
  dots[i].classList.add("active");
  index = i;
}

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    mostrarNoticia(i);
  });
});

setInterval(() => {
  let next = (index + 1) % total;
  mostrarNoticia(next);
}, 8000);