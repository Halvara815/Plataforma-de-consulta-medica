import { icon } from '../../icons.js';
import { getHerramientasConfig } from './configuracion.js';

function beep() {
  if (!getHerramientasConfig().sonidoTemporizador) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    osc.onended = () => ctx.close();
  } catch {
    /* AudioContext no disponible en este navegador */
  }
}

function formatSecs(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Temporizador</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="timer-min">Minutos</label>
          <input class="input" type="number" id="timer-min" min="0" value="5" />
        </div>
        <div class="form-field">
          <label for="timer-sec">Segundos</label>
          <input class="input" type="number" id="timer-sec" min="0" max="59" value="0" />
        </div>
      </div>
      <div class="stopwatch-display" id="timer-display" style="margin-top:16px;">05:00</div>
      <div class="view-actions" style="justify-content:center; margin-top:16px;">
        <button type="button" class="btn btn-primary btn-sm" id="timer-start">${icon('play', { size: 14 })} Iniciar</button>
        <button type="button" class="btn btn-secondary btn-sm" id="timer-pause" disabled>${icon('pause', { size: 14 })} Pausar</button>
        <button type="button" class="btn btn-secondary btn-sm" id="timer-reset">${icon('refresh', { size: 14 })} Reiniciar</button>
      </div>
    </div>
  `;

  const minInput = panelEl.querySelector('#timer-min');
  const secInput = panelEl.querySelector('#timer-sec');
  const displayEl = panelEl.querySelector('#timer-display');
  const startBtn = panelEl.querySelector('#timer-start');
  const pauseBtn = panelEl.querySelector('#timer-pause');
  const resetBtn = panelEl.querySelector('#timer-reset');

  let remaining = 300;
  let intervalId = null;

  function updateDisplay() {
    displayEl.textContent = formatSecs(remaining);
  }

  function setFromInputs() {
    remaining = (parseInt(minInput.value, 10) || 0) * 60 + (parseInt(secInput.value, 10) || 0);
    updateDisplay();
  }

  [minInput, secInput].forEach((el) => el.addEventListener('input', setFromInputs));

  startBtn.addEventListener('click', () => {
    if (intervalId) return;
    if (remaining <= 0) setFromInputs();
    if (remaining <= 0) return;
    minInput.disabled = true;
    secInput.disabled = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    intervalId = setInterval(() => {
      remaining -= 1;
      updateDisplay();
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        minInput.disabled = false;
        secInput.disabled = false;
        displayEl.style.color = 'var(--color-danger)';
        beep();
      }
    }, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    intervalId = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    minInput.disabled = false;
    secInput.disabled = false;
    displayEl.style.color = '';
    setFromInputs();
  });

  updateDisplay();
  return () => clearInterval(intervalId);
}
