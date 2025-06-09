const toggleBtn = document.getElementById('toggle-dark-mode');
const body = document.body;

// Aplicar modo oscuro según localStorage o preferencia sistema
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
