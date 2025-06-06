async function cargarLibro() {
  try {
    // Obtener slug del libro desde la URL
    const pathParts = window.location.pathname.split('/');
    const slugIndex = pathParts.indexOf('libros') + 1;
    const slug = pathParts[slugIndex];

    // Cargar JSON con los libros
    const response = await fetch('/books.json');
    const data = await response.json();

    // Buscar libro por slug
    const libro = data.books.find(b => b.slug === slug);

    if (!libro) {
      document.getElementById('title').textContent = 'Libro no encontrado';
      return;
    }

    // Rellenar datos
    document.getElementById('title').textContent = libro.title;
    document.getElementById('author').textContent = `Autor(es): ${libro.author}`;
    document.getElementById('fecha').textContent = `Fecha de lanzamiento: ${libro.fecha}`;
    document.getElementById('generos').textContent = `Géneros: ${libro.generos.join(', ')}`;
    document.getElementById('descripcion').textContent = libro.descripcion;
    document.getElementById('cover').src = `/${libro.cover}`;
    document.getElementById('cover').alt = `Portada de ${libro.title}`;

    // Crear botones para capítulos
    const container = document.getElementById('capitulos-container');
    container.innerHTML = ''; // Limpiar

    for (let i = 1; i <= libro.capitulos; i++) {
      const btn = document.createElement('a');
      btn.className = 'capitulo-btn';
      btn.textContent = `Capítulo ${i}`;
      btn.href = `/libros/${slug}/capitulos/cap${i}.html`;
      container.appendChild(btn);
    }

  } catch (error) {
    document.getElementById('title').textContent = 'Error cargando la información';
    console.error(error);
  }
}

cargarLibro();