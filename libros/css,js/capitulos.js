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

        // --- INICIO: LÓGICA DE VISTAS ÚNICAS ---
        // Obtener slug del libro desde la ruta JSON, ej: "/libros/mi-libro/..."
        const slugMatch = jsonArchivo.match(/\/libros\/([^\/]+)\//);
        const slug = slugMatch ? slugMatch[1] : "default";

        // Clave para marcar vista única de este capítulo
        const vistaKey = `visto_${slug}_${capituloID}`;

        // Clave para contador local de vistas
        const countKey = `vistas_${slug}_${capituloID}`;

        // Incrementa vistas local
        function getVistas() {
          return parseInt(localStorage.getItem(countKey)) || 0;
        }
        function incrementarVistas() {
          let vistas = getVistas();
          vistas++;
          localStorage.setItem(countKey, vistas);
          return vistas;
        }

        // Solo cuenta la vista si no está guardada
        if (!localStorage.getItem(vistaKey)) {
          localStorage.setItem(vistaKey, 'true');
          incrementarVistas();
        }

        // Mostrar contador de vistas del capítulo (opcional)
        let contadorEl = document.getElementById('contador-vistas');
        if (!contadorEl) {
          contadorEl = document.createElement('p');
          contadorEl.id = 'contador-vistas';
          contadorEl.style.marginTop = '10px';
          contadorEl.style.fontWeight = 'bold';
          contadorEl.style.color = '#ff6f3c';
          contenedor.appendChild(contadorEl);
        }
        contadorEl.textContent = `Vistas únicas de este capítulo: ${getVistas()}`;
        // --- FIN: LÓGICA DE VISTAS ÚNICAS ---


        // Agregar contenedor para los botones
        const nav = document.createElement("div");
        nav.id = "navegacion-capitulos";
        nav.className = "botones-navegacion";
        contenedor.appendChild(nav);

        // Lógica de navegación
        const capNum = parseInt(capituloID.replace("cap", ""));

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
