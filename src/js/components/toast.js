function getStack() {
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}

export function showToast({ message, tone = 'primary', duration = 3200 }) {
  const stack = getStack();
  const toastEl = document.createElement('div');
  const toneClass = tone && tone !== 'primary' ? ` toast-${tone}` : '';
  toastEl.className = `toast${toneClass}`;
  toastEl.textContent = message;
  toastEl.setAttribute('role', 'status');
  stack.appendChild(toastEl);

  const remove = () => {
    toastEl.style.animation = 'toast-in var(--transition-base) reverse';
    setTimeout(() => toastEl.remove(), 180);
  };

  const timer = setTimeout(remove, duration);
  toastEl.addEventListener('click', () => {
    clearTimeout(timer);
    remove();
  });

  return { close: remove };
}
