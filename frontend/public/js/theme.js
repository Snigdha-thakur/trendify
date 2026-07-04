/* ── TRENDIFY THEME TOGGLE ── */
(function () {
  var STORAGE_KEY = 'tfy-theme';

  /* Apply saved theme immediately (no flash) */
  if (localStorage.getItem(STORAGE_KEY) === 'light') {
    document.body.classList.add('light-theme');
  }

  function updateBtn(isLight) {
    document.querySelectorAll('.theme-toggle-btn, .c-theme-btn').forEach(function (btn) {
      btn.textContent = isLight ? '☀' : '☾';
      btn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    });
  }

  /* Ripple animation that expands from the button */
  function rippleTransition(btn, isLight) {
    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    /* Max radius to cover the whole viewport */
    var maxR = Math.ceil(
      Math.sqrt(
        Math.pow(Math.max(cx, window.innerWidth - cx), 2) +
        Math.pow(Math.max(cy, window.innerHeight - cy), 2)
      )
    );

    var ripple = document.createElement('div');
    ripple.style.cssText = [
      'position:fixed',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:2147483640',
      'transform:translate(-50%,-50%) scale(0)',
      'transition:transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease',
      'left:' + cx + 'px',
      'top:' + cy + 'px',
      'width:' + maxR * 2 + 'px',
      'height:' + maxR * 2 + 'px',
      'background:' + (isLight ? '#f5f5fa' : '#04040f'),
      'opacity:1'
    ].join(';');

    document.body.appendChild(ripple);

    /* Trigger reflow then animate */
    ripple.getBoundingClientRect();
    ripple.style.transform = 'translate(-50%,-50%) scale(1)';

    setTimeout(function () {
      ripple.style.opacity = '0';
      setTimeout(function () {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 300);
    }, 420);
  }

  window.toggleTheme = function (e) {
    /* Support both: called from onclick (e = MouseEvent) or programmatically */
    var btn = null;
    if (e && e.target) {
      btn = e.target.closest('.theme-toggle-btn, .c-theme-btn');
    }
    if (!btn) btn = document.querySelector('.theme-toggle-btn, .c-theme-btn');

    var isLight = !document.body.classList.contains('light-theme');

    if (btn) rippleTransition(btn, isLight);

    /* Small delay so ripple starts before class swap */
    setTimeout(function () {
      document.body.classList.toggle('light-theme', isLight);
      localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark');
      updateBtn(isLight);
      fixLogoText(isLight);
    }, 60);
  };

  /* Fix logo-text visibility in light mode */
  function fixLogoText(isLight) {
    document.querySelectorAll('.logo-text').forEach(function (el) {
      el.style.removeProperty('-webkit-text-fill-color');
      el.style.removeProperty('background');
      el.style.removeProperty('-webkit-background-clip');
      el.style.removeProperty('background-clip');
    });
  }

  /* Wire up buttons once DOM is ready */
  function wireButtons() {
    var isLight = document.body.classList.contains('light-theme');
    updateBtn(isLight);
    fixLogoText(isLight);
    document.querySelectorAll('.theme-toggle-btn, .c-theme-btn').forEach(function (btn) {
      /* Remove old inline onclick and re-attach properly */
      btn.removeAttribute('onclick');
      btn.addEventListener('click', window.toggleTheme);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButtons);
  } else {
    wireButtons();
  }
})();
