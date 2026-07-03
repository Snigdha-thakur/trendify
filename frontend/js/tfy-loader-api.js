/* tfy-loader-api.js — auto show/hide spinner on every fetch() call */
(function () {
  var _pending = 0;
  var _hideTimer = null;

  function getLoader() {
    return document.getElementById('tfy-loader');
  }

  function show() {
    clearTimeout(_hideTimer);
    var l = getLoader();
    if (l) {
      l.classList.remove('tfy-done');
    }
  }

  function hide() {
    // small delay so rapid sequential fetches don't flicker
    _hideTimer = setTimeout(function () {
      if (_pending <= 0) {
        var l = getLoader();
        if (l) l.classList.add('tfy-done');
        // remove from DOM after transition
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

  // Also hide on window load as fallback (for pages with no fetch)
  window.addEventListener('load', function () {
    if (_pending === 0) hide();
  });
})();
