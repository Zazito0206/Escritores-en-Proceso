document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('carousel-proximamente');
  const indicadores = document.getElementById('indicadores-proximamente');
  const flechaIzquierda = document.getElementById('izquierda-proximamente');
  const flechaDerecha = document.getElementById('derecha-proximamente');
  const contenedor = document.getElementById('carrusel-proximamente-container');

  let indiceActual = 0;

  function slugify(text) {
    return text.toString().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .trim();
  }

  fetch('proximos/proximos.json')
    .then(res => res.json())
    .then(data => {
      // Solo libros próximos y con slug válido
      const libros = data.filter(libro =>
        libro.estado === 'proximamente' &&
        libro.slug &&
        libro.slug.trim() !== ''
      );

      // Si no hay libros válidos, ocultar el contenedor
      if (libros.length === 0) {
        if (contenedor) contenedor.classList.add('hidden');
        return;
      } else {
        if (contenedor) contenedor.classList.remove('hidden');
      }

      libros.forEach(libro => {
        const link = document.createElement('a');
        link.classList.add('libro');
        link.title = libro.title || 'Libro próximo';

        const slug = libro.slug || slugify(libro.title || 'libro');

        link.removeAttribute('href');
        link.style.pointerEvents = 'none';
        link.style.cursor = 'default';
        link.dataset.href = `/libros/${slug}/info/index.html`;

        link.innerHTML = `
          <img src="${libro.cover}" alt="Portada de ${libro.title || 'Libro próximo'}" />
          <div class="contador" data-fecha="${libro.fecha}">Cargando...</div>
        `;

        carousel.appendChild(link);
      });

      crearIndicadores();
      actualizarIndicador();
      iniciarContadores();
    })
    .catch(err => {
      console.error('Error cargando proximos.json:', err);
      if (contenedor) contenedor.classList.add('hidden');
    });

  flechaDerecha.addEventListener('click', () => moverCarrusel('siguiente'));
  flechaIzquierda.addEventListener('click', () => moverCarrusel('anterior'));

  function moverCarrusel(direccion) {
    const anchoContenedor = carousel.parentElement.offsetWidth;
    if (direccion === 'siguiente') {
      carousel.parentElement.scrollLeft += anchoContenedor;
      indiceActual++;
    } else {
      carousel.parentElement.scrollLeft -= anchoContenedor;
      indiceActual--;
    }
    actualizarIndicador();
  }

  function crearIndicadores() {
    indicadores.innerHTML = '';
    const items = carousel.querySelectorAll('.libro');
    const paginas = Math.ceil(items.length / 5);
    for (let i = 0; i < paginas; i++) {
      const boton = document.createElement('button');
      if (i === 0) boton.classList.add('activo');
      boton.addEventListener('click', () => {
        carousel.parentElement.scrollLeft = i * carousel.parentElement.offsetWidth;
        indiceActual = i;
        actualizarIndicador();
      });
      indicadores.appendChild(boton);
    }
  }

  function actualizarIndicador() {
    const botones = indicadores.querySelectorAll('button');
    botones.forEach(btn => btn.classList.remove('activo'));
    if (indiceActual < 0) indiceActual = 0;
    if (indiceActual >= botones.length) indiceActual = botones.length - 1;
    if (botones[indiceActual]) botones[indiceActual].classList.add('activo');
  }

  function iniciarContadores() {
    const contadores = document.querySelectorAll('.contador');

    contadores.forEach(contador => {
      const fechaObjetivo = new Date(contador.dataset.fecha).getTime();
      const link = contador.parentElement;

      function actualizar() {
        const ahora = new Date().getTime();
        const diferencia = fechaObjetivo - ahora;

        if (diferencia <= 0) {
          contador.textContent = '¡Disponible!';
          link.href = link.dataset.href;
          link.style.pointerEvents = 'auto';
          link.style.cursor = 'pointer';
          return;
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        contador.textContent = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
      }

      actualizar();
      setInterval(actualizar, 1000);
    });
  }
});
