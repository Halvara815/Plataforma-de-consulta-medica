import { setTopbarTitle } from '../components/topbar.js';
import { login, userFacingApiError } from '../services/dataService.js';
import { navigateTo } from '../router.js';
import { appState } from '../state.js';

export function mount(container) {
  setTopbarTitle('Acceso seguro', 'Identifícate para continuar');
  container.innerHTML = `
    <section class="view" style="max-width:460px; margin:0 auto; padding-top:36px;">
      <div class="card">
        <div class="card-header">
          <div>
            <h1>Iniciar sesión</h1>
            <p class="text-tertiary">Accede con tu cuenta autorizada.</p>
          </div>
        </div>
        <form class="stack" data-form="login" novalidate>
          <label class="field">
            <span>Correo electrónico</span>
            <input name="email" type="email" autocomplete="username" required />
          </label>
          <label class="field">
            <span>Contraseña</span>
            <input name="password" type="password" autocomplete="current-password" required minlength="12" />
          </label>
          <p class="text-tertiary" data-role="status" aria-live="polite"></p>
          <button type="submit" class="btn btn-primary" data-role="submit">Entrar</button>
        </form>
      </div>
    </section>
  `;

  const form = container.querySelector('[data-form="login"]');
  const submit = container.querySelector('[data-role="submit"]');
  const status = container.querySelector('[data-role="status"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    if (!email || !password) {
      status.textContent = 'Completa correo y contraseña.';
      return;
    }

    submit.disabled = true;
    status.textContent = 'Comprobando credenciales…';
    try {
      const user = await login(email, password);
      appState.setState({ currentUser: user, dataReady: true });
      navigateTo('#/dashboard');
    } catch (error) {
      status.textContent = userFacingApiError(error);
    } finally {
      submit.disabled = false;
    }
  });
}
