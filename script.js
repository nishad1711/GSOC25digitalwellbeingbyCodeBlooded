// Initialize Firebase (already handled in firebase-config.js)

// Handle login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Login successful");
        window.location.href = "new3.html"; // Redirect after login
      })
      .catch((error) => {
        alert("Login failed: " + error.message);
      });
  });
}

// Handle registration
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Registration successful");
        window.location.href = "new3.html"; // Redirect after registration
      })
      .catch((error) => {
        alert("Registration failed: " + error.message);
      });
  });
}
