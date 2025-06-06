document.addEventListener('DOMContentLoaded', () => {

  // js para aviso temporal

  const banner = document.getElementById('beta-banner');
const closeBtn = document.getElementById('close-banner');

if (banner && closeBtn) {
  closeBtn.addEventListener('click', () => {
    banner.style.display = 'none';
  });
}
  // fin del js para aviso temporal

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
            <p>Autor: ${libro.author}</p>
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

  // Crear carruseles para los géneros deseados
  crearCarrusel('recientes');
  crearCarrusel('populares');
});
