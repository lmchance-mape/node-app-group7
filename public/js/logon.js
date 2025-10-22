document.addEventListener('DOMContentLoaded', () => {
  const door = document.getElementById('fridgeDoor');
  const loginTab = document.getElementById('login-tab');
  const createTab = document.getElementById('create-account-tab');
  const loginForm = document.getElementById('logon-form');
  const createForm = document.getElementById('create-account-form');
  const message = document.getElementById('message');


  // Simple local "database" using localStorage
  function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
  }
  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }
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


  // Account creation handler
  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('create-email').value.trim();
    const password = document.getElementById('create-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();


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


    let users = getUsers();
    if (users.find(u => u.email === email)) {
      message.textContent = 'Email already registered.';
      message.className = 'message text-red-500 text-center mt-4';
      return;
    }


    users.push({ email, password }); // ⚠️ plain password for demo only
    saveUsers(users);


    message.textContent = 'Account created! Please log in.';
    message.className = 'message text-green-500 text-center mt-4';
    loginTab.click();
  });


  // Login handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();


    let users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);


    if (!user) {
      message.textContent = 'Invalid email or password. Please try again or create an account.';
      message.className = 'message text-red-500 text-center mt-4';
      return;
    }


    message.textContent = 'Welcome back!';
    message.className = 'message text-green-500 text-center mt-4';
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });
});
