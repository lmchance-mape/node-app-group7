////////////////////////////////////////////////////////////////
//DATAMODEL.JS
//THIS IS YOUR "MODEL", IT INTERACTS WITH THE ROUTES ON YOUR
//SERVER TO FETCH AND SEND DATA.  IT DOES NOT INTERACT WITH
//THE VIEW (dashboard.html) OR THE CONTROLLER (dashboard.js)
//DIRECTLY.  IT IS A "MIDDLEMAN" BETWEEN THE SERVER AND THE
//CONTROLLER.  ALL IT DOES IS MANAGE DATA.
////////////////////////////////////////////////////////////////

async function login(email, password, { onSuccess, onError } = {}) {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data && data.message ? data.message : 'Invalid email or password.';
      if (typeof onError === 'function') onError(msg);
      return;
    }

    // If your API returns a token, store it (adjust key name as needed)
    if (data && data.token) {
      localStorage.setItem('auth_token', data.token);
    }

    // Successful login -> open the fridge, then continue
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  } catch (err) {
    if (typeof onError === 'function') onError('Network error. Please try again.');
  }
}
