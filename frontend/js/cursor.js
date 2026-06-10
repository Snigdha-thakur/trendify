/**
 * Custom Cursor for Admin/Creator Pages
 * Purple glowing dot with ring that expands on hover
 */
(function() {
  var c = document.getElementById('c');
  var cr = document.getElementById('cr');
  var b = document.body;

  if (!c) {
    c = document.createElement('div');
    c.id = 'c';
    document.body.appendChild(c);
  }
  if (!cr) {
    cr = document.createElement('div');
    cr.id = 'cr';
    cr.className = 'cr';
    document.body.appendChild(cr);
  }

  // Follow mouse movement
  document.addEventListener('mousemove', function(e) {
    c.style.left = e.clientX + 'px';
    c.style.top = e.clientY + 'px';
    cr.style.left = e.clientX + 'px';
    cr.style.top = e.clientY + 'px';
  });
  
  // Expand on hover over interactive elements
  document.querySelectorAll('a, button, .sb-link, .sb-user, select, input[type="checkbox"], input[type="radio"], .action-icon-btn, .service-btn').forEach(function(el) {
    el.addEventListener('mouseenter', function() { b.classList.add('h'); });
    el.addEventListener('mouseleave', function() { b.classList.remove('h'); });
  });
})();
