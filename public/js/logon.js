// Show overlay, play door animation, then run the callback (e.g., redirect)
function startDoorOpen(done) {
  const overlay = document.getElementById('fridgeOverlay');
  const door = document.getElementById('fridgeDoor');

  if (!overlay || !door) {
    // If markup missing, just continue
    if (typeof done === 'function') done();
    return;
  }

  // Make overlay visible
  overlay.style.display = 'flex';

  // Force a reflow so the browser applies initial state before we add the class
  // (This ensures the animation plays reliably)
  void door.offsetWidth;

  // Add the opening class to start the keyframes
  door.classList.add('is-opening');

  // Safety timeout in case animationend doesn't fire for any reason
  const durationMs = 1100; // match CSS 1.05s + a tiny buffer
  let finished = false;
  const fallback = setTimeout(() => {
    if (!finished) {
      finished = true;
      if (typeof done === 'function') done();
    }
  }, durationMs);

  const onEnd = () => {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    door.removeEventListener('animationend', onEnd);
    if (typeof done === 'function') done();
  };

  door.addEventListener('animationend', onEnd, { once: true });
}
