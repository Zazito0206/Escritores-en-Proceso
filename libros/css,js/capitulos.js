function cargarCapitulo(jsonArchivo, capituloID) {
  fetch(jsonArchivo)
    .then(response => response.json())
    .then(data => {
      const capitulo = data.capitulos[capituloID];
      const contenedor = document.getElementById("contenido-capitulo");

      if (capitulo) {
        contenedor.innerHTML = `
          <h1>Capítulo ${capituloID.replace("cap", "")}: ${capitulo.titulo}</h1>
          <p>${capitulo.contenido}</p>
        `;

        // Agregar contenedor para los botones
        const nav = document.createElement("div");
        nav.id = "navegacion-capitulos";
        nav.className = "botones-navegacion";
        contenedor.appendChild(nav);

        // Lógica de navegación
        const capNum = parseInt(capituloID.replace("cap", ""));
        const slugMatch = jsonArchivo.match(/\/libros\/([^\/]+)\//);
        const slug = slugMatch ? slugMatch[1] : "default";

        const crearBoton = (texto, href) => {
          const a = document.createElement("a");
          a.textContent = texto;
          a.href = href;
          a.className = "boton-capitulo";
          return a;
        };

        // Botón Anterior
        if (capNum > 1) {
          const anteriorHref = `cap${capNum - 1}.html`;
          nav.appendChild(crearBoton("Capítulo anterior", anteriorHref));
        } else {
          const espacio = document.createElement("div");
          nav.appendChild(espacio); // para mantener el espacio visual
        }

        // Verificar si existe el siguiente capítulo
        const siguienteHref = `cap${capNum + 1}.html`;
        fetch(siguienteHref, { method: "HEAD" })
          .then(response => {
            if (response.ok) {
              nav.appendChild(crearBoton("Capítulo siguiente", siguienteHref));
            } else {
              nav.appendChild(crearBoton("Regresar", `/libros/${slug}/info/index.html`));
            }
          })
          .catch(() => {
            nav.appendChild(crearBoton("Regresar", `/libros/${slug}/info/index.html`));
          });

      } else {
        contenedor.innerHTML = `<p>Capítulo no encontrado.</p>`;
      }
    })
    .catch(error => {
      console.error("Error al cargar el capítulo:", error);
      document.getElementById("contenido-capitulo").innerHTML =
        "<p>Error al cargar el contenido del capítulo.</p>";
    });
}

// Modo oscuro
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

// Prevención de copiar contenido

// 1. Desactivar clic derecho
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

// 2. Desactivar copiar
document.addEventListener('copy', function(e) {
  e.preventDefault();
  alert('Copiar texto está deshabilitado en esta página.');
});

// 3. Desactivar selección de texto
document.addEventListener('selectstart', function(e) {
  e.preventDefault();
});
