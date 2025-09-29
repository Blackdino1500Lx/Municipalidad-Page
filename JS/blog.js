document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('commentModal');
    if (!modal) {
      console.warn('Modal no encontrado: asegúrate de tener <div id="commentModal"> en tu HTML.');
      return;
    }
  
    const openButtons = document.querySelectorAll('.action-btn'); // si tienes más botones reutilizables
    const closeBtn = modal.querySelector('.close');
    const form = modal.querySelector('form');
  
    function openModal() {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // evitar scroll detrás del modal
    }
  
    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  
    // Abrir desde todos los botones .action-btn
    if (openButtons.length === 0) {
      console.warn('No se encontraron botones .action-btn para abrir el modal.');
    }
    openButtons.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    }));
  
    // Cerrar con la X
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    } else {
      console.warn('No se encontró el elemento .close dentro del modal.');
    }
  
    // Cerrar clickeando fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  
    // Si hay formulario, prevenir envío por defecto y cerrar (aquí puedes añadir lo de agregar comentario)
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO: aquí puedes recoger los datos y agregarlos dinámicamente a la sección Comentarios
        console.log('Formulario enviado (simulado).');
        closeModal();
        form.reset();
      });
    }
  
    console.log('Script modal cargado correctamente.');
  });
  

