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
    const estado = document.createElement('div');
    estado.className = 'estado-libro';
    estado.textContent = libro.estado === 'completo' ? 'Libro completo' : 'En progreso';
    document.getElementById('fecha').insertAdjacentElement('afterend', estado);
 

    // Insertar estado debajo de fecha
    document.getElementById('fecha').insertAdjacentElement('afterend', estado);

    // --- Aquí insertamos total de vistas justo después del estado ---
    let totalVistas = 0;
    for (let i = 1; i <= libro.capitulos; i++) {
      const countKey = `vistas_${slug}_cap${i}`;
      totalVistas += parseInt(localStorage.getItem(countKey)) || 0;
    }

    const vistasEl = document.createElement('div');
    vistasEl.className = 'estado-libro';
    vistasEl.style.marginTop = '5px';
    vistasEl.textContent = `Vistas: ${totalVistas}`;
    estado.insertAdjacentElement('afterend', vistasEl);
    vistasEl.style.marginTop = '12px';  // 12px de espacio arriba



    // Insertar justo después del estado
    estado.insertAdjacentElement('afterend', vistasEl);

    document.getElementById('generos').textContent = `Géneros: ${libro.generos.join(', ')}`;
    document.getElementById('descripcion').textContent = libro.descripcion;
    const coverEl = document.getElementById('cover');
    coverEl.src = `/${libro.cover}`;
    coverEl.alt = `Portada de ${libro.title}`;

    // Si el libro es patrocinado, agregar logo en la esquina
    if (libro.patrocinado) {
      const badge = document.createElement('div');
      badge.className = 'badge-logo';
      badge.innerHTML = `<img src="/images/logo-patrocinado.png" alt="Patrocinado" />`;
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      coverEl.parentNode.insertBefore(wrapper, coverEl);
      wrapper.appendChild(coverEl);
      wrapper.appendChild(badge);
    }

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
