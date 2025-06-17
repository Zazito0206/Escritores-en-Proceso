// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCxyeiuOBCTwY1-Avq5TfOEa7HePsb2s9A",
  authDomain: "escritores-en-proceso-ep.firebaseapp.com",
  projectId: "escritores-en-proceso-ep",
  storageBucket: "escritores-en-proceso-ep.appspot.com",
  messagingSenderId: "1068751834388",
  appId: "1:1068751834388:web:2cc1b82d4e15db47970601"
};

// Inicializar Firebase si aún no está inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// Login con correo y contraseña
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          alert('¡Bienvenido!');
          window.location.href = '/index.html';
        })
        .catch(error => {
          alert('Error: ' + error.message);
        });
    });
  }

  // Login con Google
  const googleBtn = document.getElementById('google-login');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(() => {
          alert('¡Inicio de sesión exitoso con Google!');
          window.location.href = '/index.html';
        })
        .catch(error => {
          alert('Error con Google: ' + error.message);
        });
    });
  }

  // Login con Facebook
  const facebookBtn = document.getElementById('facebook-login');
  if (facebookBtn) {
    facebookBtn.addEventListener('click', () => {
      const provider = new firebase.auth.FacebookAuthProvider();
      auth.signInWithPopup(provider)
        .then(() => {
          alert('¡Inicio de sesión exitoso con Facebook!');
          window.location.href = '/index.html';
        })
        .catch(error => {
          alert('Error con Facebook: ' + error.message);
        });
    });
  }
});
