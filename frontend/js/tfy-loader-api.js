/* tfy-loader-api.js — auto show/hide spinner on every fetch() call */
(function () {
  var _pending = 0;
  var _hideTimer = null;
  var _slowTimer = null;

  function getLoader() {
    return document.getElementById('tfy-loader');
  }

  function show() {
    clearTimeout(_hideTimer);
    var l = getLoader();
    if (l) {
      l.classList.remove('tfy-done');
      // After 5s still loading, show a helpful message
      clearTimeout(_slowTimer);
      _slowTimer = setTimeout(function () {
        var lbl = l.querySelector('.tfy-label');
        if (lbl) lbl.textContent = 'Server waking up, please wait...';
      }, 5000);
    }
  }

  function hide() {
    clearTimeout(_slowTimer);
    _hideTimer = setTimeout(function () {
      if (_pending <= 0) {
        var l = getLoader();
        if (l) {
          var lbl = l.querySelector('.tfy-label');
          if (lbl) lbl.textContent = 'Please wait...';
          l.classList.add('tfy-done');
        }
        setTimeout(function () {
          var l2 = document.getElementById('tfy-loader');
          if (l2 && l2.parentNode) l2.parentNode.removeChild(l2);
        }, 450);
      }
    }, 120);
  }

  // Intercept native fetch
  var _origFetch = window.fetch;
  window.fetch = function () {
    _pending++;
    show();
    return _origFetch.apply(this, arguments).finally(function () {
      _pending = Math.max(0, _pending - 1);
      if (_pending === 0) hide();
    });
  };

  // Hide on window load as fallback
  window.addEventListener('load', function () {
    if (_pending === 0) hide();
  });

  // ── Keep Render backend warm ──
  // Ping the health endpoint every 14 min so the free-tier server never cold-starts
  var API = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://trendify-pxkx.onrender.com';

  function ping() {
    _origFetch(API + '/health', { method: 'GET', cache: 'no-store' }).catch(function () {});
  }

  // Ping immediately on page load (wakes server before user clicks anything)
  // Small delay so it doesn't block initial page render
  setTimeout(ping, 500);
  // Then every 14 minutes
  setInterval(ping, 14 * 60 * 1000);
})();
