document.addEventListener('DOMContentLoaded', () => {
  const door = document.getElementById('fridgeDoor');
  const loginTab = document.getElementById('login-tab');
  const createTab = document.getElementById('create-account-tab');
  const loginForm = document.getElementById('logon-form');
  const createForm = document.getElementById('create-account-form');
  const message = document.getElementById('message');

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Play fridge door animation on load
  if (door) {
    door.classList.add('is-opening');
    door.addEventListener('animationend', () => {
      door.style.display = 'none';
    }, { once: true });
  }

  // Tab switching
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    createTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    createForm.classList.add('hidden');
    message.textContent = '';
  });

  createTab.addEventListener('click', () => {
    createTab.classList.add('active');
    loginTab.classList.remove('active');
    createForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    message.textContent = '';
  });

  //
  // Create Account handler (talks to backend /api/create-account)
  //
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('create-email').value.trim();
    const password = document.getElementById('create-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    // basic client-side checks
    if (!isValidEmail(email)) {
      message.textContent = 'Please enter a valid email.';
      message.className = 'message text-red-500 text-center mt-4';
      return;
    }
    if (password.length < 6) {
      message.textContent = 'Password must be at least 6 characters.';
      message.className = 'message text-red-500 text-center mt-4';
      return;
    }
    if (password !== confirmPassword) {
      message.textContent = 'Passwords do not match. Please try again.';
      message.className = 'message text-red-500 text-center mt-4';
      return;
    }

    // talk to backend
    try {
      const res = await fetch('/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // ex: 409 if email already exists
        message.textContent = data.message || 'Account creation failed.';
        message.className = 'message text-red-500 text-center mt-4';
        return;
      }


    users.push({ email, password }); // ⚠️ plain password for demo only
    saveUsers(users);


    message.textContent = 'Account created! Please log in.';
    message.className = 'message text-green-500 text-center mt-4';
    loginTab.click();
  });

  //
  // Login handler (talks to backend /api/login and stores jwtToken)
  //
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      message.textContent = 'Please enter your email and password.';
      message.className = 'message text-red-500 text-center mt-4';
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        message.textContent = data.message || 'Login failed. Please try again.';
        message.className = 'message text-red-500 text-center mt-4';
        return;
      }

      // ✅ Save the JWT so inventory.js can use it
      // server.js returns { token: "..." } when login succeeds
      localStorage.setItem('jwtToken', data.token);

      message.textContent = 'Welcome back!';
      message.className = 'message text-green-500 text-center mt-4';

      // small redirect delay like before
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      message.textContent = 'Network error. Please try again.';
      message.className = 'message text-red-500 text-center mt-4';
    }
  });
});

