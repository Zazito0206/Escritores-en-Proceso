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
      const libros = data.filter(libro =>
        libro.estado === 'proximamente' &&
        libro.slug &&
        libro.slug.trim() !== ''
      );

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

        // Usar la URL definida en el JSON o generar una por defecto
        const url = libro.url ? libro.url : `/libros/${libro.slug}/info/index.html`;

        // Si el libro está disponible, habilitar el enlace
        if (new Date(libro.fecha).getTime() <= Date.now()) {
          link.setAttribute('href', url);
          link.style.pointerEvents = 'auto';
          link.style.cursor = 'pointer';
        } else {
          link.removeAttribute('href');
          link.style.pointerEvents = 'none';
          link.style.cursor = 'default';
        }

        // Mostrar el estado del libro (Nuevo Libro o Nuevo Capítulo)
        const tipoEstado = libro.tipo === 'libro' ? 'Nuevo Libro' : 'Nuevo Capítulo';

        // Mostrar el logo si es patrocinado
        const logoPatrocinado = libro.patrocinado 
          ? '<div class="badge-logo"><img src="/images/logo-patrocinado.png" alt="Libro patrocinado" /></div>' 
          : '';

        link.innerHTML = `
          <img src="${libro.cover}" alt="Portada de ${libro.title || 'Libro próximo'}" />
          <span class="estado-libro">${tipoEstado}</span>
          ${logoPatrocinado}
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
          link.setAttribute('href', link.dataset.href || link.getAttribute('href'));
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
