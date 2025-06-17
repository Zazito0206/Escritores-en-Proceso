// ... tu código existente ...

// Firebase SDKs (asegúrate de tenerlos también en tu HTML)
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
    // Ocultar botón de login y mostrar avatar
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
    // Mostrar login y ocultar avatar
    if (btnLogin) btnLogin.style.display = "inline-block";
    if (userInfo) userInfo.style.display = "none";
  }
});
