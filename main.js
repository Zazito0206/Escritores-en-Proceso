document.addEventListener('DOMContentLoaded', () => {

  // --- Banner con cierre temporal cada 30 minutos ---
  const banner = document.getElementById('beta-banner');
  const closeBtn = document.getElementById('close-banner');
  const storageKey = 'betaBannerClosedAt';
  const hideDuration = 30 * 60 * 1000; // 30 minutos en ms

  function fadeIn(element) {
    element.style.opacity = 0;
    element.style.display = 'block';
    let last = +new Date();
    const tick = function () {
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
    const tick = function () {
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

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleDarkMode);
  }

  // --- Crear carruseles para géneros ---
  crearCarrusel('recientes');
  crearCarrusel('populares');

  // --- Firebase Auth: mostrar botón login o avatar ---
  const firebaseConfig = {
    apiKey: "AIzaSyCxyeiuOBCTwY1-Avq5TfOEa7HePsb2s9A",
    authDomain: "escritores-en-proceso-ep.firebaseapp.com",
    projectId: "escritores-en-proceso-ep",
    storageBucket: "escritores-en-proceso-ep.appspot.com",
    messagingSenderId: "1068751834388",
    appId: "1:1068751834388:web:2cc1b82d4e15db47970601"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  auth.onAuthStateChanged(user => {
    const btnLogin = document.getElementById("btn-login");
    const userInfo = document.getElementById("user-info");
    const userPhoto = document.getElementById("user-photo");

    if (user) {
      if (btnLogin) btnLogin.style.display = "none";
      if (userInfo) userInfo.style.display = "flex";

      if (user.photoURL) {
        userPhoto.src = user.photoURL;
      } else {
        const initials = user.displayName
          ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
          : user.email[0].toUpperCase();
        userPhoto.src = `https://via.placeholder.com/40x40.png?text=${initials}`;
      }
    } else {
      if (btnLogin) btnLogin.style.display = "inline-block";
      if (userInfo) userInfo.style.display = "none";
    }
  });

});
