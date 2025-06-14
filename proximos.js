document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('carousel-proximamente');
  const indicadores = document.getElementById('indicadores-proximamente');
  const flechaIzquierda = document.getElementById('izquierda-proximamente');
  const flechaDerecha = document.getElementById('derecha-proximamente');

  let libros = [];
  let indiceActual = 0;

  // Función para crear slugs URL friendly para rutas
  function slugify(text) {
    return text.toString().toLowerCase()
      .normalize('NFD')                      // Descompone acentos en caracteres base + diacríticos
      .replace(/[\u0300-\u036f]/g, '')       // Elimina los diacríticos (acentos)
      .replace(/ñ/g, 'n')                    // Cambia ñ por n
      .replace(/\s+/g, '-')                  // Espacios por guiones
      .replace(/[^\w\-]+/g, '')              // Elimina caracteres no alfanuméricos ni guiones
      .replace(/\-\-+/g, '-')                // Reemplaza guiones dobles por uno solo
      .trim();
  }

  fetch('proximos.json')
    .then(res => res.json())
    .then(data => {
      libros = data.filter(libro => libro.estado === 'proximamente');

      libros.forEach(libro => {
        const link = document.createElement('a');
        link.classList.add('libro');
        link.title = libro.slug || 'Libro próximo';
        link.href = `/libros/${libro.slug || slugify(libro.slug)}\/info/index.html`;
        link.style.cursor = 'pointer';

        link.innerHTML = `
          <img src="${libro.cover}" alt="Portada" />
          <div class="contador" data-fecha="${libro.fecha}">Cargando...</div>
        `;

        carousel.appendChild(link);
      });

      crearIndicadores();
      actualizarIndicador();
      iniciarContadores();
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

      function actualizar() {
        const ahora = new Date().getTime();
        const diferencia = fechaObjetivo - ahora;

        if (diferencia <= 0) {
          contador.textContent = '¡Disponible!';
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
