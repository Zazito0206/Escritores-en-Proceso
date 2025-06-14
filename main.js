document.addEventListener('DOMContentLoaded', () => {

  // --- Banner con cierre temporal cada 12 horas ---
  const banner = document.getElementById('beta-banner');
  const closeBtn = document.getElementById('close-banner');
  const storageKey = 'betaBannerClosedAt';
  const hideDuration = 1 * 60 * 60 * 1000; // 1 hora en milisegundos

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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
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

    flechaDerecha.addEventListener('click', () => {
      moverCarrusel('siguiente');
    });

    flechaIzquierda.addEventListener('click', () => {
      moverCarrusel('anterior');
    });

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
  }

  // --- Toggle modo oscuro ---
  const toggleBtn = document.getElementById('toggle-dark-mode');
  const body = document.body;

  const savedMode = localStorage.getItem('dark-mode');
  if (savedMode === 'enabled') {
    body.classList.add('dark-mode');
  } else if (!savedMode) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark-mode');
      localStorage.setItem('dark-mode', 'enabled');
    }
  }

  function toggleDarkMode() {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('dark-mode', 'enabled');
    } else {
      localStorage.setItem('dark-mode', 'disabled');
    }
  }

  toggleBtn.addEventListener('click', toggleDarkMode);

  // --- Crear carruseles para géneros que quieras mostrar
  crearCarrusel('recientes');
  crearCarrusel('populares');

  // --- Registrar Service Worker y activar actualizaciones automáticas
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker registrado con éxito:', reg.scope);

        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('ℹ️ Nueva versión del Service Worker instalada. Actualizando...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(err => {
        console.log('❌ Error al registrar el Service Worker:', err);
      });
  }

  // --- Manejo de instalación PWA (botón personalizado) ---
  let deferredPrompt;
  const installBtn = document.getElementById('install-btn');

  // Asignar evento click siempre, ejecuta prompt solo si deferredPrompt está listo
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      console.log('No hay prompt de instalación disponible');
      return;
    }

    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('📲 El usuario aceptó instalar la app');
    } else {
      console.log('🙅‍♂️ El usuario canceló la instalación');
    }

    deferredPrompt = null;
    installBtn.style.display = 'none';
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ App instalada correctamente');
    installBtn.style.display = 'none';
  });

}); // <-- Fin de DOMContentLoaded
