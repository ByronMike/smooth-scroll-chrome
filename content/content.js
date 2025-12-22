// Smooth Scroll Chrome - Content Script
// Core scrolling logic for auto-scrolling pages and embedded elements

(function() {
  'use strict';

  // Scroll state
  let isScrolling = false;
  let isPaused = false;
  let scrollSpeed = 0.4; // pixels per frame (medium speed)
  let animationFrameId = null;
  let targetElement = null; // null means scroll the whole page
  let accumulatedScroll = 0; // accumulate fractional pixels

  // Speed presets (pixels per frame at 60fps)
  const SPEED_PRESETS = {
    slow: 0.2,
    medium: 0.4,
    fast: 0.6
  };

  // Speed multiplier range
  const MIN_SPEED_MULTIPLIER = 0.1;
  const MAX_SPEED_MULTIPLIER = 1;

  /**
   * Check if an element is scrollable
   */
  function isScrollable(el) {
    if (!el || el === document.body || el === document.documentElement) {
      return false;
    }
    const hasScrollableContent = el.scrollHeight > el.clientHeight;
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    return hasScrollableContent && (overflowY === 'scroll' || overflowY === 'auto');
  }

  /**
   * Check if the page itself is scrollable
   */
  function isPageScrollable() {
    return document.documentElement.scrollHeight > window.innerHeight;
  }

  /**
   * Find all scrollable elements on the page
   */
  function findScrollableElements() {
    const scrollables = [];

    // Check if page is scrollable
    if (isPageScrollable()) {
      scrollables.push({
        element: null,
        label: 'Whole Page',
        type: 'page'
      });
    }

    // Find all scrollable elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (isScrollable(el)) {
        // Try to get a meaningful label
        let label = el.tagName.toLowerCase();
        if (el.id) {
          label = `#${el.id}`;
        } else if (el.className && typeof el.className === 'string') {
          const firstClass = el.className.split(' ')[0];
          if (firstClass) {
            label = `.${firstClass}`;
          }
        }

        scrollables.push({
          element: el,
          label: label,
          type: 'element'
        });
      }
    });

    return scrollables;
  }

  /**
   * Get the current scroll position
   */
  function getScrollPosition() {
    if (targetElement) {
      return {
        top: targetElement.scrollTop,
        max: targetElement.scrollHeight - targetElement.clientHeight
      };
    }
    return {
      top: window.scrollY || document.documentElement.scrollTop,
      max: document.documentElement.scrollHeight - window.innerHeight
    };
  }

  /**
   * Perform a single scroll step
   */
  function scrollStep() {
    if (!isScrolling || isPaused) {
      return;
    }

    const pos = getScrollPosition();

    // Check if we've reached the bottom
    if (pos.top >= pos.max) {
      stopScroll();
      window.dispatchEvent(new CustomEvent('smoothscroll:ended'));
      return;
    }

    // Accumulate fractional pixels and only scroll when >= 1 pixel
    accumulatedScroll += scrollSpeed;

    if (accumulatedScroll >= 1) {
      const pixelsToScroll = Math.floor(accumulatedScroll);
      accumulatedScroll -= pixelsToScroll;

      // Perform the scroll
      if (targetElement) {
        targetElement.scrollBy({
          top: pixelsToScroll,
          behavior: 'instant'
        });
      } else {
        window.scrollBy({
          top: pixelsToScroll,
          behavior: 'instant'
        });
      }
    }

    // Schedule next frame
    animationFrameId = requestAnimationFrame(scrollStep);
  }

  /**
   * Start auto-scrolling
   */
  function startScroll(element = null) {
    if (isScrolling && !isPaused) {
      return;
    }

    targetElement = element;
    isScrolling = true;
    isPaused = false;
    accumulatedScroll = 0; // Reset accumulator

    animationFrameId = requestAnimationFrame(scrollStep);
    window.dispatchEvent(new CustomEvent('smoothscroll:started'));
  }

  /**
   * Pause scrolling
   */
  function pauseScroll() {
    if (!isScrolling) {
      return;
    }

    isPaused = true;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    window.dispatchEvent(new CustomEvent('smoothscroll:paused'));
  }

  /**
   * Resume scrolling
   */
  function resumeScroll() {
    if (!isScrolling || !isPaused) {
      return;
    }

    isPaused = false;
    animationFrameId = requestAnimationFrame(scrollStep);
    window.dispatchEvent(new CustomEvent('smoothscroll:resumed'));
  }

  /**
   * Toggle play/pause
   */
  function toggleScroll() {
    if (!isScrolling) {
      startScroll(targetElement);
    } else if (isPaused) {
      resumeScroll();
    } else {
      pauseScroll();
    }
  }

  /**
   * Stop scrolling completely
   */
  function stopScroll() {
    isScrolling = false;
    isPaused = false;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    window.dispatchEvent(new CustomEvent('smoothscroll:stopped'));
  }

  /**
   * Stop and scroll back to top
   */
  function resetScroll() {
    stopScroll();

    if (targetElement) {
      targetElement.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.dispatchEvent(new CustomEvent('smoothscroll:reset'));
  }

  /**
   * Set scroll speed using a preset
   */
  function setSpeedPreset(preset) {
    if (SPEED_PRESETS[preset] !== undefined) {
      scrollSpeed = SPEED_PRESETS[preset];
      window.dispatchEvent(new CustomEvent('smoothscroll:speedchanged', {
        detail: { speed: scrollSpeed, preset: preset }
      }));
    }
  }

  /**
   * Set scroll speed using a multiplier (0.1 to 5)
   */
  function setSpeedMultiplier(multiplier) {
    multiplier = Math.max(MIN_SPEED_MULTIPLIER, Math.min(MAX_SPEED_MULTIPLIER, multiplier));
    scrollSpeed = SPEED_PRESETS.medium * multiplier;
    window.dispatchEvent(new CustomEvent('smoothscroll:speedchanged', {
      detail: { speed: scrollSpeed, multiplier: multiplier }
    }));
  }

  /**
   * Set the target element for scrolling
   */
  function setTargetElement(element) {
    const wasScrolling = isScrolling && !isPaused;

    if (wasScrolling) {
      pauseScroll();
    }

    targetElement = element;

    if (wasScrolling) {
      resumeScroll();
    }

    window.dispatchEvent(new CustomEvent('smoothscroll:targetchanged', {
      detail: { element: element }
    }));
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      isScrolling: isScrolling,
      isPaused: isPaused,
      speed: scrollSpeed,
      multiplier: scrollSpeed / SPEED_PRESETS.medium,
      targetElement: targetElement,
      position: getScrollPosition()
    };
  }

  // Expose the API globally
  window.SmoothScrollChrome = {
    start: startScroll,
    pause: pauseScroll,
    resume: resumeScroll,
    toggle: toggleScroll,
    stop: stopScroll,
    reset: resetScroll,
    setSpeedPreset: setSpeedPreset,
    setSpeedMultiplier: setSpeedMultiplier,
    setTargetElement: setTargetElement,
    findScrollableElements: findScrollableElements,
    isScrollable: isScrollable,
    getState: getState,
    SPEED_PRESETS: SPEED_PRESETS,
    MIN_SPEED_MULTIPLIER: MIN_SPEED_MULTIPLIER,
    MAX_SPEED_MULTIPLIER: MAX_SPEED_MULTIPLIER
  };

  // Listen for messages from popup or background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'getState':
        sendResponse(getState());
        break;
      case 'start':
        startScroll(targetElement);
        sendResponse({ success: true });
        break;
      case 'pause':
        pauseScroll();
        sendResponse({ success: true });
        break;
      case 'toggle':
        toggleScroll();
        sendResponse(getState());
        break;
      case 'stop':
        stopScroll();
        sendResponse({ success: true });
        break;
      case 'reset':
        resetScroll();
        sendResponse({ success: true });
        break;
      case 'setSpeed':
        if (message.preset) {
          setSpeedPreset(message.preset);
        } else if (message.multiplier !== undefined) {
          setSpeedMultiplier(message.multiplier);
        }
        sendResponse({ success: true, speed: scrollSpeed });
        break;
      case 'showWidget':
        window.dispatchEvent(new CustomEvent('smoothscroll:showwidget'));
        sendResponse({ success: true });
        break;
      case 'hideWidget':
        window.dispatchEvent(new CustomEvent('smoothscroll:hidewidget'));
        sendResponse({ success: true });
        break;
      case 'toggleWidget':
        window.dispatchEvent(new CustomEvent('smoothscroll:togglewidget'));
        sendResponse({ success: true });
        break;
    }
    return true;
  });

  console.log('Smooth Scroll Chrome: Content script loaded');
})();
