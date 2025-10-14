// Funcionalidad para mostrar/ocultar desarrolladores
const btnDevs = document.querySelector(".activar-devs");
const devsSection = document.querySelector(".devs");
const cerrarDevsBtn = document.querySelector(".cerrar-devs");

if (btnDevs && devsSection && cerrarDevsBtn) {
  btnDevs.addEventListener("click", () => {
    devsSection.classList.add("devs-active");
  });

  cerrarDevsBtn.addEventListener("click", () => {
    devsSection.classList.remove("devs-active");
  }); 
}

document.addEventListener('DOMContentLoaded', () => {
  // selecciono sólo los <a class="dev"> evitando otros hijos como .cerrar-devs
  const devs = Array.from(document.querySelectorAll('.devs > a.dev'));
  const fondos = Array.from(document.querySelectorAll('.devs .fondos > div'));

  devs.forEach((dev, i) => {
    dev.addEventListener('mouseover', () => {
      fondos.forEach(f => f.classList.remove('active'));
      if (fondos[i]) fondos[i].classList.add('active');
    });

    dev.addEventListener('mouseout', () => {
      if (fondos[i]) fondos[i].classList.remove('active');
    });
  });
});