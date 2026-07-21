import { icon } from '../../icons.js';

function formatMs(ms) {
  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (n) => String(n).padStart(2, '0');
  return `${hours > 0 ? pad(hours) + ':' : ''}${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Cronómetro</h2></div>
      <div class="stopwatch-display" id="stopwatch-display">00:00.00</div>
      <div class="view-actions" style="justify-content:center; margin-top:16px;">
        <button type="button" class="btn btn-primary btn-sm" id="sw-start">${icon('play', { size: 14 })} Iniciar</button>
        <button type="button" class="btn btn-secondary btn-sm" id="sw-lap" disabled>${icon('clipboard', { size: 14 })} Vuelta</button>
        <button type="button" class="btn btn-secondary btn-sm" id="sw-reset">${icon('refresh', { size: 14 })} Reiniciar</button>
      </div>
      <div id="sw-laps" class="stack" style="margin-top:16px; gap:0;"></div>
    </div>
  `;

  const displayEl = panelEl.querySelector('#stopwatch-display');
  const startBtn = panelEl.querySelector('#sw-start');
  const lapBtn = panelEl.querySelector('#sw-lap');
  const resetBtn = panelEl.querySelector('#sw-reset');
  const lapsEl = panelEl.querySelector('#sw-laps');

  let running = false;
  let startTime = 0;
  let elapsed = 0;
  let intervalId = null;
  let laps = [];

  function tick() {
    displayEl.textContent = formatMs(elapsed + (Date.now() - startTime));
  }

  startBtn.addEventListener('click', () => {
    if (!running) {
      running = true;
      startTime = Date.now();
      intervalId = setInterval(tick, 30);
      startBtn.innerHTML = `${icon('pause', { size: 14 })} Pausar`;
      lapBtn.disabled = false;
    } else {
      running = false;
      elapsed += Date.now() - startTime;
      clearInterval(intervalId);
      startBtn.innerHTML = `${icon('play', { size: 14 })} Reanudar`;
    }
  });

  lapBtn.addEventListener('click', () => {
    laps.unshift(formatMs(elapsed + (running ? Date.now() - startTime : 0)));
    lapsEl.innerHTML = laps
      .map((l, i) => `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color); font-size:13px;"><span>Vuelta ${laps.length - i}</span><span>${l}</span></div>`)
      .join('');
  });

  resetBtn.addEventListener('click', () => {
    running = false;
    clearInterval(intervalId);
    elapsed = 0;
    laps = [];
    lapsEl.innerHTML = '';
    displayEl.textContent = '00:00.00';
    startBtn.innerHTML = `${icon('play', { size: 14 })} Iniciar`;
    lapBtn.disabled = true;
  });

  return () => clearInterval(intervalId);
}
