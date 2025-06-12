document.addEventListener('DOMContentLoaded', () => {

  // --- Banner con cierre temporal cada 12 horas ---
  const banner = document.getElementById('beta-banner');
  const closeBtn = document.getElementById('close-banner');
  const storageKey = 'betaBannerClosedAt';
  const hideDuration = 1 * 60 * 60 * 1000; // 1 hora en milisegundos

  // Animación para mostrar (fadeIn)
  function fadeIn(element) {
    element.style.opacity = 0;
    element.style.display = 'block';
    let last = +new Date();
    const tick = function() {
      element.style.opacity = +element.style.opacity + (new Date() - last) / 400;
      last = +new Date();
      if (+element.style.opacity < 1) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      }
    };
    tick();
  }

  // Animación para ocultar (fadeOut)
  function fadeOut(element, callback) {
    element.style.opacity = 1;
    let last = +new Date();
    const tick = function() {
      element.style.opacity = +element.style.opacity - (new Date() - last) / 400;
      last = +new Date();
      if (+element.style.opacity > 0) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      } else {
        element.style.display = 'none';
        if (callback) callback();
      }
    };
    tick();
  }

  // Determina si debe mostrarse el banner (si pasaron >12h desde cierre)
  function shouldShowBanner() {
    const closedAt = localStorage.getItem(storageKey);
    if (!closedAt) return true;
    const closedTime = parseInt(closedAt, 10);
    return (Date.now() - closedTime) > hideDuration;
  }

  if (banner && closeBtn) {
    if (shouldShowBanner()) {
      fadeIn(banner);
    } else {
      banner.style.display = 'none';
    }

    closeBtn.addEventListener('click', () => {
      fadeOut(banner, () => {
        localStorage.setItem(storageKey, Date.now().toString());
      });
    });
  }
  // --- Fin banner ---


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


  // Función que crea un carrusel para un género
  function crearCarrusel(genero) {
    const carousel = document.getElementById(`carousel-${genero}`);
    const indicadores = document.getElementById(`indicadores-${genero}`);
    const flechaIzquierda = document.getElementById(`izquierda-${genero}`);
    const flechaDerecha = document.getElementById(`derecha-${genero}`);

    let librosGenero = [];
    let indiceActual = 0;

    fetch('books.json')
      .then(res => res.json())
      .then(data => {
        librosGenero = data.books.filter(libro => libro.genres.includes(genero));

        librosGenero.forEach(libro => {
          const link = document.createElement('a');
          link.classList.add('libro');
          link.setAttribute('title', libro.title);

          const slug = slugify(libro.title);
          link.href = `/libros/${slug}/info/index.html`;

          link.innerHTML = `
            <img src="${libro.cover}" alt="Portada de ${libro.title}" />
            <h4>${libro.title}</h4>
           <span class="estado-libro">${
  {
    'completo': 'Completo',
    'en-progreso': 'En progreso',
    'proximamente': 'Próximamente'
  }[libro.estado] || 'Desconocido'
}</span>

            ${libro.patrocinado ? '<div class="badge-logo"><img src="/images/logo-patrocinado.png" alt="Libro patrocinado" /></div>' : ''}
          `;

          carousel.appendChild(link);
        });

        crearIndicadores();
        actualizarIndicador();
      });

    // Eventos flechas para mover el carrusel
    flechaDerecha.addEventListener('click', () => {
      moverCarrusel('siguiente');
    });

    flechaIzquierda.addEventListener('click', () => {
      moverCarrusel('anterior');
    });

    // Función para mover el scroll del carrusel y actualizar indicador
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

    // Crea botones indicadores según páginas (5 libros por página)
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

    // Actualiza el indicador activo
    function actualizarIndicador() {
      const botones = indicadores.querySelectorAll('button');
      botones.forEach(btn => btn.classList.remove('activo'));
      if (indiceActual < 0) indiceActual = 0;
      if (indiceActual >= botones.length) indiceActual = botones.length - 1;
      if (botones[indiceActual]) botones[indiceActual].classList.add('activo');
    }
  }


  // --- Toggle modo oscuro ---

  const toggleBtn = document.getElementById('toggle-dark-mode');
  const body = document.body;

  // Carga modo guardado o usa preferencia sistema
  const savedMode = localStorage.getItem('dark-mode');
  if (savedMode === 'enabled') {
    body.classList.add('dark-mode');
  } else if (!savedMode) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark-mode');
      localStorage.setItem('dark-mode', 'enabled');
    }
  }

  // Cambia el modo oscuro
  function toggleDarkMode() {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('dark-mode', 'enabled');
    } else {
      localStorage.setItem('dark-mode', 'disabled');
    }
  }

  toggleBtn.addEventListener('click', toggleDarkMode);


  // Crear carruseles para géneros que quieras mostrar
  crearCarrusel('recientes');
  crearCarrusel('populares');

});
