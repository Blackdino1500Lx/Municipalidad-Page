/*Modal Comentarios*/ 
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('commentModal');
    if (!modal) {
      console.warn('Modal no encontrado: asegúrate de tener <div id="commentModal"> en tu HTML.');
      return;
    }
  
    const openButtons = document.querySelectorAll('.action-btn'); 
    const closeBtn = modal.querySelector('.close');
    const form = modal.querySelector('form');
  
    function openModal() {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; 
    }
  
    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  
    if (openButtons.length === 0) {
      console.warn('No se encontraron botones .action-btn para abrir el modal.');
    }
    openButtons.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    }));
  
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    } else {
      console.warn('No se encontró el elemento .close dentro del modal.');
    }
  
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Formulario enviado (simulado).');
        closeModal();
        form.reset();
      });
    }
  
    console.log('Script modal cargado correctamente.');
  });
  
// --- Galería: cambiar imagen principal ---
const featureImg = document.querySelector('.feature-image img');
const thumbsGallery = document.querySelectorAll('.gallery-thumb');

thumbsGallery.forEach(thumb => {
  thumb.addEventListener('click', (event) => {
    event.preventDefault();

    featureImg.style.transition = "opacity 0.25s ease";
    featureImg.style.opacity = 0;

    setTimeout(() => {
      featureImg.src = thumb.src;
      featureImg.alt = thumb.alt;
      featureImg.style.opacity = 1;

      featureImg.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 200);

    thumbsGallery.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  });
});

const gallery = document.querySelector('.image-gallery');
const leftArrow = document.querySelector('.gallery-arrow.left');
const rightArrow = document.querySelector('.gallery-arrow.right');

function updateArrows() {
  const scrollLeft = gallery.scrollLeft;
  const maxScrollLeft = gallery.scrollWidth - gallery.clientWidth;
  leftArrow.classList.toggle('visible', scrollLeft > 10);
  rightArrow.classList.toggle('visible', scrollLeft < maxScrollLeft - 10);
}

leftArrow.addEventListener('click', () => {
  gallery.scrollBy({ left: -200, behavior: 'smooth' });
});

rightArrow.addEventListener('click', () => {
  gallery.scrollBy({ left: 200, behavior: 'smooth' });
});

gallery.addEventListener('scroll', updateArrows);
window.addEventListener('load', updateArrows);
window.addEventListener('resize', updateArrows);


//Conexion Base de datos

//Enviar Comentarios
/*const supabase = window.supabaseInstance;

//Anadir Comentarios CAMBIAR NOMBRES
function attachFormListener(formId, handler) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', handler);
} */
