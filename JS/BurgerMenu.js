
document.addEventListener("DOMContentLoaded", () => {
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
});
