import { setTopbarTitle } from '../components/topbar.js';
import { icon } from '../icons.js';
import { login, registerDoctor, userFacingApiError } from '../services/dataService.js';
import { navigateTo } from '../router.js';
import { appState } from '../state.js';

const logoUrl = new URL('../../assets/logo.webp', import.meta.url).href;

export function mount(container) {
  document.body.classList.add('is-login-view');
  setTopbarTitle('Acceso seguro', 'Identifícate para continuar');
  let mode = 'login';

  const setStatus = (message, type = '') => {
    const status = container.querySelector('[data-role="status"]');
    if (!status) return;
    status.className = `login-status ${type}`;
    status.textContent = message;
  };

  const render = () => {
    container.innerHTML = mode === 'login' ? loginTemplate() : registrationTemplate();
    bindEvents();
  };

  const bindEvents = () => {
    container.querySelectorAll('[data-action="switch-mode"]').forEach((button) => {
      button.addEventListener('click', () => {
        mode = button.dataset.mode;
        render();
      });
    });

    const form = container.querySelector('[data-form="login"]');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = form.elements.email.value.trim();
        const password = form.elements.password.value;
        const submit = form.querySelector('[data-role="submit"]');
        if (!email || !password) {
          setStatus('Completa tu correo electrónico y contraseña.');
          return;
        }

        submit.disabled = true;
        setStatus('Comprobando credenciales…');
        try {
          const user = await login(email, password);
          appState.setState({ currentUser: user, dataReady: true });
          navigateTo('#/dashboard');
        } catch (error) {
          setStatus(userFacingApiError(error));
        } finally {
          submit.disabled = false;
        }
      });
      return;
    }

    const registrationForm = container.querySelector('[data-form="register"]');
    registrationForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(registrationForm);
      const password = String(data.get('password') || '');
      const confirmation = String(data.get('passwordConfirmation') || '');
      const submit = registrationForm.querySelector('[data-role="submit"]');
      if (password !== confirmation) {
        setStatus('Las contraseñas no coinciden.');
        return;
      }

      submit.disabled = true;
      setStatus('Enviando solicitud de registro…');
      try {
        await registerDoctor({
          nombre: String(data.get('nombre') || '').trim(),
          email: String(data.get('email') || '').trim(),
          password,
          especialidad: String(data.get('especialidad') || '').trim(),
          cedula: String(data.get('cedula') || '').trim(),
          consultorio: String(data.get('consultorio') || '').trim() || undefined,
        });
        setStatus('Solicitud enviada. La administración debe activar tu cuenta antes de iniciar sesión.', 'is-success');
        registrationForm.reset();
      } catch (error) {
        setStatus(userFacingApiError(error));
      } finally {
        submit.disabled = false;
      }
    });
  };

  render();
}

function shell(content) {
  return `
    <section class="login-screen" aria-labelledby="login-title">
      <div class="login-atmosphere" aria-hidden="true"></div>
      <div class="login-card">
        <div class="login-brand">
          <img src="${logoUrl}" alt="" class="login-brand-logo" />
          <div>
            <strong>Consulta Práctica</strong>
            <span>EMR / EHR · Acceso clínico</span>
          </div>
        </div>
        ${content}
      </div>
    </section>
  `;
}

function loginTemplate() {
  return shell(`
    <div class="login-heading">
      <span class="login-kicker">Área clínica protegida</span>
      <h1 id="login-title">Iniciar sesión</h1>
      <p>Ingresa con la cuenta asignada por la administración.</p>
    </div>

    <form class="login-form" data-form="login" novalidate>
      <label class="login-field">
        <span>Correo electrónico</span>
        <span class="login-input-wrap">
          ${icon('mail', { size: 18 })}
          <input name="email" type="email" autocomplete="username" required placeholder="nombre@clinica.com" />
        </span>
      </label>
      <label class="login-field">
        <span>Contraseña</span>
        <span class="login-input-wrap">
          ${icon('shield', { size: 18 })}
          <input name="password" type="password" autocomplete="current-password" required minlength="12" placeholder="Tu contraseña" />
        </span>
      </label>
      <label class="login-session-option">
        <input name="remember" type="checkbox" checked />
        <span>Mantener la sesión activa en este equipo</span>
      </label>
      <p class="login-status" data-role="status" aria-live="polite"></p>
      <button type="submit" class="login-submit" data-role="submit">
        <span>Entrar al sistema</span>${icon('arrow-right', { size: 18 })}
      </button>
    </form>

    <p class="login-help">¿Eres médico y aún no tienes cuenta? <button type="button" class="login-link" data-action="switch-mode" data-mode="register">Solicitar registro</button></p>
  `);
}

function registrationTemplate() {
  return shell(`
    <div class="login-heading">
      <span class="login-kicker">Registro profesional</span>
      <h1 id="login-title">Crear solicitud</h1>
      <p>Las cuentas de médicos son revisadas y activadas por la administración.</p>
    </div>

    <form class="login-form login-registration-form" data-form="register" novalidate>
      <label class="login-field">
        <span>Nombre profesional</span>
        <span class="login-input-wrap">${icon('user', { size: 18 })}<input name="nombre" required maxlength="120" autocomplete="name" placeholder="Dra. / Dr. Nombre" /></span>
      </label>
      <label class="login-field">
        <span>Correo electrónico</span>
        <span class="login-input-wrap">${icon('mail', { size: 18 })}<input name="email" type="email" required autocomplete="email" placeholder="nombre@clinica.com" /></span>
      </label>
      <div class="login-field-row">
        <label class="login-field">
          <span>Especialidad</span>
          <span class="login-input-wrap"><input name="especialidad" required maxlength="120" placeholder="Medicina general" /></span>
        </label>
        <label class="login-field">
          <span>Cédula profesional</span>
          <span class="login-input-wrap"><input name="cedula" required maxlength="80" placeholder="Tu registro" /></span>
        </label>
      </div>
      <label class="login-field">
        <span>Consultorio <em>opcional</em></span>
        <span class="login-input-wrap"><input name="consultorio" maxlength="120" placeholder="Consultorio 1" /></span>
      </label>
      <label class="login-field">
        <span>Contraseña</span>
        <span class="login-input-wrap">${icon('shield', { size: 18 })}<input name="password" type="password" required minlength="12" maxlength="128" autocomplete="new-password" placeholder="Mínimo 12 caracteres" /></span>
      </label>
      <label class="login-field">
        <span>Confirmar contraseña</span>
        <span class="login-input-wrap">${icon('shield', { size: 18 })}<input name="passwordConfirmation" type="password" required minlength="12" autocomplete="new-password" placeholder="Repite tu contraseña" /></span>
      </label>
      <p class="login-status" data-role="status" aria-live="polite"></p>
      <button type="submit" class="login-submit" data-role="submit">
        <span>Enviar solicitud</span>${icon('arrow-right', { size: 18 })}
      </button>
    </form>

    <p class="login-help">¿Ya tienes una cuenta? <button type="button" class="login-link" data-action="switch-mode" data-mode="login">Volver a iniciar sesión</button></p>
  `);
}

export function unmount() {
  document.body.classList.remove('is-login-view');
}
