// ========== TEST LOGIN/REGISTER LOGIC ==========

document.addEventListener('DOMContentLoaded', () => {
  const authLayer = document.getElementById('auth-layer');
  const appContainer = document.getElementById('app-container');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');

  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');

  // Toggle to Register form
  showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  // Toggle to Login form
  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Dummy Login
  loginBtn.addEventListener('click', () => {
    authLayer.style.display = 'none';
    appContainer.style.display = 'block';
  });

  // Dummy Register
  registerBtn.addEventListener('click', () => {
    authLayer.style.display = 'none';
    appContainer.style.display = 'block';
  });
});
