// Smooth Scroll Chrome - Floating Widget

(function() {
  'use strict';

  // Widget state
  let widgetElement = null;
  let isMinimized = false;
  let isSelecting = false;
  let currentPreset = 'medium';
  let currentMultiplier = 1;
  let widgetPosition = { right: 20, bottom: 20 };

  // Load saved position
  function loadPosition() {
    chrome.storage.local.get(['widgetPosition'], (result) => {
      if (result.widgetPosition) {
        widgetPosition = result.widgetPosition;
        updateWidgetPosition();
      }
    });
  }

  // Save position
  function savePosition() {
    chrome.storage.local.set({ widgetPosition: widgetPosition });
  }

  // Update widget position
  function updateWidgetPosition() {
    if (widgetElement) {
      widgetElement.style.right = widgetPosition.right + 'px';
      widgetElement.style.bottom = widgetPosition.bottom + 'px';
      widgetElement.style.left = 'auto';
      widgetElement.style.top = 'auto';
    }
  }

  // Create the widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.className = 'ssc-widget';
    widget.id = 'ssc-widget';
    widget.innerHTML = `
      <div class="ssc-panel">
        <div class="ssc-header">
          <span class="ssc-title">Auto Scroll</span>
          <button class="ssc-minimize-btn" title="Minimize">
            <span class="ssc-icon ssc-icon-minimize"></span>
          </button>
        </div>
        <div class="ssc-body">
          <div class="ssc-controls">
            <button class="ssc-btn ssc-btn-play" title="Play/Pause">
              <span class="ssc-icon ssc-icon-play"></span>
            </button>
            <button class="ssc-btn ssc-btn-stop" title="Stop and Reset">
              <span class="ssc-icon ssc-icon-stop"></span>
            </button>
          </div>
          <div class="ssc-speed-presets">
            <button class="ssc-speed-btn" data-speed="slow">Slow</button>
            <button class="ssc-speed-btn ssc-active" data-speed="medium">Med</button>
            <button class="ssc-speed-btn" data-speed="fast">Fast</button>
          </div>
          <div class="ssc-slider-container">
            <div class="ssc-slider-label">
              <span>Speed</span>
              <span class="ssc-speed-value">0.4x</span>
            </div>
            <input type="range" class="ssc-slider" min="0.1" max="1" step="0.1" value="0.4">
          </div>
          <button class="ssc-select-btn" title="Select scrollable element">
            <span class="ssc-icon ssc-icon-target"></span>
            <span>Select Element</span>
          </button>
          <div class="ssc-target-label">Target: Whole Page</div>
        </div>
        <div class="ssc-status">Ready</div>
      </div>
    `;

    return widget;
  }

  // Initialize the widget
  function initWidget() {
    if (widgetElement) return;

    widgetElement = createWidget();
    document.body.appendChild(widgetElement);

    // Load saved position
    loadPosition();
    updateWidgetPosition();

    // Setup event listeners
    setupDragging();
    setupControls();
    setupStateListeners();
  }

  // Setup dragging functionality
  function setupDragging() {
    const header = widgetElement.querySelector('.ssc-header');
    let isDragging = false;
    let startX, startY;
    let startRight, startBottom;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.ssc-minimize-btn')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = widgetElement.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startBottom = window.innerHeight - rect.bottom;

      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      widgetPosition.right = Math.max(0, startRight - deltaX);
      widgetPosition.bottom = Math.max(0, startBottom - deltaY);

      // Keep widget within viewport
      const rect = widgetElement.getBoundingClientRect();
      widgetPosition.right = Math.min(widgetPosition.right, window.innerWidth - rect.width);
      widgetPosition.bottom = Math.min(widgetPosition.bottom, window.innerHeight - rect.height);

      updateWidgetPosition();
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
        savePosition();
      }
    });
  }

  // Setup control buttons
  function setupControls() {
    // Minimize button
    const minimizeBtn = widgetElement.querySelector('.ssc-minimize-btn');
    minimizeBtn.addEventListener('click', () => {
      isMinimized = !isMinimized;
      widgetElement.classList.toggle('ssc-minimized', isMinimized);

      const icon = minimizeBtn.querySelector('.ssc-icon');
      icon.className = isMinimized ? 'ssc-icon ssc-icon-expand' : 'ssc-icon ssc-icon-minimize';
    });

    // Play/Pause button
    const playBtn = widgetElement.querySelector('.ssc-btn-play');
    playBtn.addEventListener('click', () => {
      window.SmoothScrollChrome.toggle();
    });

    // Stop button
    const stopBtn = widgetElement.querySelector('.ssc-btn-stop');
    stopBtn.addEventListener('click', () => {
      window.SmoothScrollChrome.reset();
    });

    // Speed preset buttons
    const speedBtns = widgetElement.querySelectorAll('.ssc-speed-btn');
    const presetMultipliers = { slow: 0.2, medium: 0.4, fast: 0.6 };
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = btn.dataset.speed;
        window.SmoothScrollChrome.setSpeedPreset(speed);
        currentPreset = speed;

        // Update active state
        speedBtns.forEach(b => b.classList.remove('ssc-active'));
        btn.classList.add('ssc-active');

        // Update slider with preset value
        updateSlider(presetMultipliers[speed]);
      });
    });

    // Speed slider
    const slider = widgetElement.querySelector('.ssc-slider');
    slider.addEventListener('input', (e) => {
      const multiplier = parseFloat(e.target.value);
      window.SmoothScrollChrome.setSpeedMultiplier(multiplier);
      currentMultiplier = multiplier;

      // Update display
      widgetElement.querySelector('.ssc-speed-value').textContent = multiplier.toFixed(1) + 'x';

      // Clear preset selection
      speedBtns.forEach(b => b.classList.remove('ssc-active'));
    });

    // Element selector
    const selectBtn = widgetElement.querySelector('.ssc-select-btn');
    selectBtn.addEventListener('click', () => {
      if (isSelecting) {
        cancelSelection();
      } else {
        startSelection();
      }
    });
  }

  // Update slider value
  function updateSlider(multiplier) {
    const slider = widgetElement.querySelector('.ssc-slider');
    slider.value = multiplier;
    widgetElement.querySelector('.ssc-speed-value').textContent = multiplier.toFixed(1) + 'x';
    currentMultiplier = multiplier;
  }

  // Update status display
  function updateStatus(text, className = '') {
    const status = widgetElement.querySelector('.ssc-status');
    status.textContent = text;
    status.className = 'ssc-status' + (className ? ' ' + className : '');
  }

  // Update play button state
  function updatePlayButton(isPlaying, isPaused) {
    const playBtn = widgetElement.querySelector('.ssc-btn-play');
    const icon = playBtn.querySelector('.ssc-icon');

    if (isPlaying && !isPaused) {
      playBtn.classList.add('ssc-playing');
      icon.className = 'ssc-icon ssc-icon-pause';
    } else {
      playBtn.classList.remove('ssc-playing');
      icon.className = 'ssc-icon ssc-icon-play';
    }
  }

  // Setup state change listeners
  function setupStateListeners() {
    window.addEventListener('smoothscroll:started', () => {
      updatePlayButton(true, false);
      updateStatus('Scrolling...', 'ssc-status-scrolling');
    });

    window.addEventListener('smoothscroll:paused', () => {
      updatePlayButton(true, true);
      updateStatus('Paused', 'ssc-status-paused');
    });

    window.addEventListener('smoothscroll:resumed', () => {
      updatePlayButton(true, false);
      updateStatus('Scrolling...', 'ssc-status-scrolling');
    });

    window.addEventListener('smoothscroll:stopped', () => {
      updatePlayButton(false, false);
      updateStatus('Ready');
    });

    window.addEventListener('smoothscroll:ended', () => {
      updatePlayButton(false, false);
      updateStatus('Reached end');
    });

    window.addEventListener('smoothscroll:reset', () => {
      updatePlayButton(false, false);
      updateStatus('Ready');
    });

    window.addEventListener('smoothscroll:targetchanged', (e) => {
      const element = e.detail.element;
      const label = element ? getElementLabel(element) : 'Whole Page';
      widgetElement.querySelector('.ssc-target-label').textContent = 'Target: ' + label;
    });

    // Widget visibility
    window.addEventListener('smoothscroll:showwidget', () => {
      widgetElement.style.display = 'block';
    });

    window.addEventListener('smoothscroll:hidewidget', () => {
      widgetElement.style.display = 'none';
    });

    window.addEventListener('smoothscroll:togglewidget', () => {
      const isVisible = widgetElement.style.display !== 'none';
      widgetElement.style.display = isVisible ? 'none' : 'block';
    });
  }

  // Get a label for an element
  function getElementLabel(el) {
    if (!el) return 'Whole Page';

    if (el.id) return '#' + el.id;

    if (el.className && typeof el.className === 'string') {
      const firstClass = el.className.split(' ')[0];
      if (firstClass) return '.' + firstClass;
    }

    return el.tagName.toLowerCase();
  }

  // Start element selection mode
  function startSelection() {
    isSelecting = true;

    const selectBtn = widgetElement.querySelector('.ssc-select-btn');
    selectBtn.classList.add('ssc-selecting');
    selectBtn.querySelector('span:last-child').textContent = 'Cancel';

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'ssc-overlay';
    overlay.id = 'ssc-selection-overlay';
    document.body.appendChild(overlay);

    // Create highlight element
    const highlight = document.createElement('div');
    highlight.className = 'ssc-highlight';
    highlight.id = 'ssc-highlight';
    highlight.style.display = 'none';
    document.body.appendChild(highlight);

    // Find scrollable elements
    const scrollables = window.SmoothScrollChrome.findScrollableElements();

    // Track hovered element
    let hoveredElement = null;

    // Function to get element under cursor by temporarily hiding overlay
    function getElementUnderCursor(x, y) {
      overlay.style.pointerEvents = 'none';
      highlight.style.pointerEvents = 'none';
      const target = document.elementFromPoint(x, y);
      overlay.style.pointerEvents = 'auto';
      highlight.style.pointerEvents = 'auto';
      return target;
    }

    // Function to find scrollable element from a target
    function findScrollableFromTarget(target) {
      if (!target) return null;

      let el = target;
      while (el && el !== document.body && el !== document.documentElement) {
        if (window.SmoothScrollChrome.isScrollable(el)) {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    }

    overlay.addEventListener('mousemove', (e) => {
      const target = getElementUnderCursor(e.clientX, e.clientY);
      if (!target) return;

      // Find the nearest scrollable ancestor
      const scrollable = findScrollableFromTarget(target);

      if (scrollable && scrollable !== hoveredElement) {
        hoveredElement = scrollable;
        const rect = scrollable.getBoundingClientRect();
        highlight.style.display = 'block';
        highlight.style.left = rect.left + 'px';
        highlight.style.top = rect.top + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
      } else if (!scrollable && hoveredElement) {
        hoveredElement = null;
        highlight.style.display = 'none';
      }
    });

    overlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get the element under cursor at click time
      const target = getElementUnderCursor(e.clientX, e.clientY);
      const scrollable = findScrollableFromTarget(target);

      if (scrollable) {
        window.SmoothScrollChrome.setTargetElement(scrollable);
      } else {
        // Select whole page
        window.SmoothScrollChrome.setTargetElement(null);
      }

      cancelSelection();
    });

    // ESC to cancel
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        cancelSelection();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // Cancel element selection
  function cancelSelection() {
    isSelecting = false;

    const selectBtn = widgetElement.querySelector('.ssc-select-btn');
    selectBtn.classList.remove('ssc-selecting');
    selectBtn.querySelector('span:last-child').textContent = 'Select Element';

    // Remove overlay and highlight
    const overlay = document.getElementById('ssc-selection-overlay');
    if (overlay) overlay.remove();

    const highlight = document.getElementById('ssc-highlight');
    if (highlight) highlight.remove();
  }

  // Show/hide widget
  function showWidget() {
    if (widgetElement) {
      widgetElement.style.display = 'block';
    }
  }

  function hideWidget() {
    if (widgetElement) {
      widgetElement.style.display = 'none';
    }
  }

  function toggleWidget() {
    if (widgetElement) {
      const isVisible = widgetElement.style.display !== 'none';
      widgetElement.style.display = isVisible ? 'none' : 'block';
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Expose widget controls
  window.SmoothScrollChromeWidget = {
    show: showWidget,
    hide: hideWidget,
    toggle: toggleWidget
  };

  console.log('Smooth Scroll Chrome: Widget loaded');
})();
