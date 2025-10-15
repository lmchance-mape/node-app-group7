document.addEventListener('DOMContentLoaded', () => {
  const door = document.getElementById('fridgeDoor');
  const loginTab = document.getElementById('login-tab');
  const createTab = document.getElementById('create-account-tab');
  const loginForm = document.getElementById('logon-form');
  const createForm = document.getElementById('create-account-form');
  const message = document.getElementById('message');


  // Play fridge door animation on load
  if (door) {
    door.classList.add('is-opening');
    door.addEventListener('animationend', () => {
      // once opened, let clicks through
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


  // Fake login handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    message.textContent = 'Welcome back!';
    message.className = 'message text-green-500 text-center mt-4';
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });


  // Fake account creation handler
  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    message.textContent = 'Account created! Please log in.';
    message.className = 'message text-green-500 text-center mt-4';
    loginTab.click();
  });
});



