// ========================
// DUMMY ECHOAI LOGIC - TESTING ONLY
// ========================

document.addEventListener('DOMContentLoaded', () => {
  // Grab elements
  const loadingOverlay = document.getElementById('loading-overlay');
  const authLayer = document.getElementById('auth-layer');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const appContainer = document.getElementById('app-container');

  // ========== HIDE LOADING OVERLAY ==========
  setTimeout(() => {
    loadingOverlay.style.display = 'none';
  }, 1500); // 1.5s delay for testing

  // ========== TOGGLE LOGIN/REGISTER FORMS ==========
  showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // ========== DUMMY LOGIN ==========
  loginBtn.addEventListener('click', () => {
    // Fake validation
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (email && password) {
      authLayer.style.display = 'none';
      appContainer.style.display = 'block';
      console.log('Logged in:', email);
    } else {
      alert('Please enter email and password for testing.');
    }
  });

  // ========== DUMMY REGISTER ==========
  registerBtn.addEventListener('click', () => {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    if (name && email && password) {
      authLayer.style.display = 'none';
      appContainer.style.display = 'block';
      console.log('Registered:', name, email);
    } else {
      alert('Please fill all fields for testing.');
    }
  });

  // ========== NAVIGATION BETWEEN VIEWS ==========
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view-container');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active from all nav items
      navItems.forEach(i => i.classList.remove('active'));
      // Hide all views
      views.forEach(v => v.classList.remove('active'));

      // Activate clicked nav
      item.classList.add('active');
      const viewId = item.dataset.view + '-view';
      const viewEl = document.getElementById(viewId);
      if (viewEl) viewEl.classList.add('active');
    });
  });
});
