document.addEventListener('DOMContentLoaded', function () {
  const hamburguesa = document.querySelector('.hamburguesa');
  const menu = document.querySelector('.menu-hamburguesa');

  hamburguesa.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  // Cerrar menú si se hace clic fuera de él
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
      menu.classList.remove('active');
    }
  });
});
