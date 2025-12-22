// Smooth Scroll Chrome - Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const resetBtn = document.getElementById('resetBtn');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const speedBtns = document.querySelectorAll('.speed-btn');
  const toggleWidgetBtn = document.getElementById('toggleWidget');
  const statusEl = document.getElementById('status');

  let currentState = {
    isScrolling: false,
    isPaused: false
  };

  // Get current tab and state
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function sendMessage(action, data = {}) {
    try {
      const tab = await getCurrentTab();
      return await chrome.tabs.sendMessage(tab.id, { action, ...data });
    } catch (error) {
      console.error('Failed to send message:', error);
      updateStatus('Error: Reload page', 'error');
      return null;
    }
  }

  // Update UI based on state
  function updateUI(state) {
    if (!state) return;

    currentState = state;

    const btnIcon = toggleBtn.querySelector('.icon');
    const btnText = toggleBtn.querySelector('.btn-text');

    if (state.isScrolling && !state.isPaused) {
      toggleBtn.classList.add('playing');
      btnIcon.className = 'icon icon-pause';
      btnText.textContent = 'Pause';
      updateStatus('Scrolling...', 'scrolling');
    } else if (state.isScrolling && state.isPaused) {
      toggleBtn.classList.remove('playing');
      btnIcon.className = 'icon icon-play';
      btnText.textContent = 'Resume';
      updateStatus('Paused', 'paused');
    } else {
      toggleBtn.classList.remove('playing');
      btnIcon.className = 'icon icon-play';
      btnText.textContent = 'Start';
      updateStatus('Ready');
    }

    // Update slider
    if (state.multiplier) {
      speedSlider.value = state.multiplier;
      speedValue.textContent = state.multiplier.toFixed(1) + 'x';
    }
  }

  function updateStatus(text, className = '') {
    statusEl.textContent = text;
    statusEl.className = 'status' + (className ? ' ' + className : '');
  }

  // Initialize
  async function init() {
    const state = await sendMessage('getState');
    if (state) {
      updateUI(state);
    }
  }

  // Toggle play/pause
  toggleBtn.addEventListener('click', async () => {
    const state = await sendMessage('toggle');
    updateUI(state);
  });

  // Reset
  resetBtn.addEventListener('click', async () => {
    await sendMessage('reset');
    updateUI({
      isScrolling: false,
      isPaused: false
    });
  });

  // Speed presets
  speedBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const speed = btn.dataset.speed;
      await sendMessage('setSpeed', { preset: speed });

      // Update active state
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update slider based on preset
      const multipliers = { slow: 0.5, medium: 1, fast: 2 };
      speedSlider.value = multipliers[speed];
      speedValue.textContent = multipliers[speed].toFixed(1) + 'x';
    });
  });

  // Speed slider
  speedSlider.addEventListener('input', async () => {
    const multiplier = parseFloat(speedSlider.value);
    speedValue.textContent = multiplier.toFixed(1) + 'x';
    await sendMessage('setSpeed', { multiplier });

    // Clear preset selection
    speedBtns.forEach(b => b.classList.remove('active'));
  });

  // Toggle widget visibility
  toggleWidgetBtn.addEventListener('click', async () => {
    await sendMessage('toggleWidget');
  });

  // Initialize popup
  init();
});
