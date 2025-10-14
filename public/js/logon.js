// Show overlay, play door animation, then run the callback (e.g., redirect)
function startDoorOpen(done) {
    const overlay = document.getElementById('fridgeOverlay');
    const door = document.getElementById('fridgeDoor');

    if (!overlay || !door) {
        console.warn('Fridge overlay or door missing, skipping animation');
        if (typeof done === 'function') done();
        return;
    }

    console.log('Starting fridge door animation');
    overlay.style.display = 'flex';
    void door.offsetWidth; // Force reflow
    door.classList.add('is-opening');

    const durationMs = 1100;
    let finished = false;
    const fallback = setTimeout(() => {
        if (!finished) {
            finished = true;
            console.log('Animation fallback triggered');
            if (typeof done === 'function') done();
        }
    }, durationMs);

    const onEnd = () => {
        if (finished) return;
        finished = true;
        clearTimeout(fallback);
        door.removeEventListener('animationend', onEnd);
        console.log('Animation completed');
        if (typeof done === 'function') done();
    };

    door.addEventListener('animationend', onEnd, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Logon page loaded');
    const loginTab = document.getElementById('login-tab');
    const createAccountTab = document.getElementById('create-account-tab');
    const logonForm = document.getElementById('logon-form');
    const createAccountForm = document.getElementById('create-account-form');
    const message = document.getElementById('message');
    const loginButton = document.querySelector('#logon-form button[type="submit"]');
    const createAccountButton = document.querySelector('#create-account-form button[type="submit"]');

    if (!loginTab || !createAccountTab || !logonForm || !createAccountForm || !message || !loginButton || !createAccountButton) {
        console.error('Missing DOM elements');
        message.textContent = 'Page loading error. Please refresh.';
        message.classList.add('text-red-500');
        return;
    }

    loginTab.addEventListener('click', () => {
        console.log('Login tab clicked');
        loginTab.classList.add('active');
        createAccountTab.classList.remove('active');
        logonForm.classList.remove('hidden');
        createAccountForm.classList.add('hidden');
        message.textContent = '';
    });

    createAccountTab.addEventListener('click', () => {
        console.log('Create Account tab clicked');
        createAccountTab.classList.add('active');
        loginTab.classList.remove('active');
        createAccountForm.classList.remove('hidden');
        logonForm.classList.add('hidden');
        message.textContent = '';
    });

    logonForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted');
        // Disable button to prevent multiple submissions
        loginButton.disabled = true;

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            message.textContent = 'Please enter both email and password.';
            message.classList.add('text-red-500');
            loginButton.disabled = false;
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Login successful, initiating animation');
                startDoorOpen(() => {
                    console.log('Redirecting to dashboard');
                    localStorage.setItem('jwtToken', data.token);
                    window.location.href = '/dashboard';
                });
            } else {
                console.error('Login failed:', data.message);
                message.textContent = data.message || 'Login failed.';
                message.classList.add('text-red-500');
                loginButton.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            message.textContent = 'Error connecting to server. Please try again.';
            message.classList.add('text-red-500');
            loginButton.disabled = false;
        }
    });

    createAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Create Account form submitted');
        // Disable button to prevent multiple submissions
        createAccountButton.disabled = true;

        const email = document.getElementById('create-email').value;
        const password = document.getElementById('create-password').value;

        if (!email || !password) {
            message.textContent = 'Please enter both email and password.';
            message.classList.add('text-red-500');
            createAccountButton.disabled = false;
            return;
        }

        try {
            const response = await fetch('/api/create-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Account creation successful');
                message.textContent = 'Account created! Please log in.';
                message.classList.add('text-green-500');
                createAccountButton.disabled = false;
                loginTab.click();
            } else {
                console.error('Account creation failed:', data.message);
                message.textContent = data.message || 'Error creating account.';
                message.classList.add('text-red-500');
                createAccountButton.disabled = false;
            }
        } catch (error) {
            console.error('Account creation error:', error);
            message.textContent = 'Error connecting to server. Please try again.';
            message.classList.add('text-red-500');
            createAccountButton.disabled = false;
        }
    });
});