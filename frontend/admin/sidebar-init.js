// Shared admin sidebar logic — included by every admin page

// Inject hamburger button into nav, and remove it from breadcrumb
document.addEventListener('DOMContentLoaded', function() {
  var nav = document.getElementById('nav');
  if (nav && !nav.querySelector('.sb-toggle-btn')) {
    var btn = document.createElement('button');
    btn.className = 'sb-toggle-btn nav-hamburger';
    btn.setAttribute('onclick', 'toggleSidebar()');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="12" width="14" height="2" rx="1"/></svg>';
    nav.insertBefore(btn, nav.firstChild);
  }
  // Remove hamburger from breadcrumb if present
  var bc = document.querySelector('.admin-breadcrumb');
  if (bc) {
    var bcBtn = bc.querySelector('.sb-toggle-btn');
    if (bcBtn) bcBtn.remove();
  }
});

function toggleSidebar() {
  var sb = document.getElementById('adminSidebar');
  var ov = document.getElementById('sbOverlay');
  sb.classList.toggle('collapsed');
  if (ov) ov.classList.toggle('open', sb.classList.contains('collapsed') && window.innerWidth <= 768);
  try { localStorage.setItem('adminSidebarCollapsed', sb.classList.contains('collapsed')); } catch(e){}
}

function toggleTheme() { document.body.classList.toggle('light-theme'); }

function toggleUserMenu(e) {
  if (e) e.stopPropagation();
  var popup = document.getElementById('userPopup');
  if (popup) popup.classList.toggle('open');
}

document.addEventListener('click', function(e) {
  if (e.target.closest && e.target.closest('.user-popup-item')) return;
  var popup = document.getElementById('userPopup');
  var user = document.getElementById('sbUser');
  if (popup && user && !popup.contains(e.target) && !user.contains(e.target)) popup.classList.remove('open');
});

// Wrap .sb-link text nodes in <span class="sb-link-text"> for CSS targeting + tooltip
function initSidebar() {
  var sb = document.getElementById('adminSidebar');
  if (!sb) return;
  sb.querySelectorAll('.sb-link').forEach(function(link) {
    Array.from(link.childNodes).forEach(function(node) {
      if (node.nodeType === 3 && node.textContent.trim()) {
        var span = document.createElement('span');
        span.className = 'sb-link-text';
        span.textContent = node.textContent.trim();
        link.replaceChild(span, node);
        if (!link.title) link.title = span.textContent;
      }
    });
  });
  // Restore collapsed state
  try {
    if (localStorage.getItem('adminSidebarCollapsed') === 'true') sb.classList.add('collapsed');
  } catch(e){}
}

function updateSidebarIcons() {
  var iconMap = {
    'overview.html': '<rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    'payments.html': '<rect x="1" y="4" width="14" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="3" y="6" width="6" height="1.5" rx="0.75" fill="currentColor"/><rect x="3" y="9" width="4" height="1.5" rx="0.75" fill="currentColor"/>',
    'wallet-balance.html': '<path d="M2 5h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="11" cy="8" r="1.5"/>',
    'payout-history.html': '<path d="M8 2.5a5.5 5.5 0 1 0 5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 4v4.5l2 1" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    'index.html': '<path d="M3 11V6h2v5H3zM7 11V4h2v7H7zM11 11V8h2v3h-2z" fill="currentColor"/><path d="M4 13h8" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    'referral-history.html': '<circle cx="4" cy="5" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="9" cy="11" r="2"/><path d="M5.2 6.5l3.1 2.1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10.8 6.5l-3.1 2.1" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    'referral-payouts.html': '<circle cx="6" cy="5" r="2"/><path d="M4 11c0-1.7 1.3-3 3-3h3c1.7 0 3 1.3 3 3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M12.5 6.5l2 1-2 1" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    'creator-payouts.html': '<circle cx="6" cy="5" r="3"/><path d="M2 13.5c0-2.2 1.8-4 4-4s4 1.8 4 4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M11 4.5l.8 2.3h2.4l-1.9 1.4.7 2.3-1.9-1.4-1.9 1.4.7-2.3-1.9-1.4h2.4z" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    'user-management.html': '<circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6H2z" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    'kyc-management.html': '<path d="M8 1l6 3v4c0 3.5-2.5 6.5-6 7.5C2.5 14.5 0 11.5 0 8V4l8-3z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5 8l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.2"/>',
    'digital-products.html': '<path d="M4 2h6l3 3v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10 2v3h3" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M6 8h4M6 11h4" fill="none" stroke="currentColor" stroke-width="1.2"/>',
    'webhook-logs.html': '<path d="M3 5h4M3 11h4M9 4h4M9 12h4" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="3" cy="5" r="1.3"/><circle cx="3" cy="11" r="1.3"/><circle cx="13" cy="4" r="1.3"/><circle cx="13" cy="12" r="1.3"/>',
    'payout-webhooks.html': '<path d="M3 4h8M3 8h6M3 12h4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M12 3.5l2 1.5-2 1.5" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    'wallet-logs.html': '<path d="M2 5h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M2 8h10M4 10h4" fill="none" stroke="currentColor" stroke-width="1.2"/>',
    'gateway-logs.html': '<rect x="2" y="3" width="12" height="4" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="2" y="9" width="12" height="4" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="5" r="0.8"/><circle cx="5" cy="11" r="0.8"/><circle cx="11" cy="5" r="0.8"/>'
  };

  document.querySelectorAll('.admin-sidebar .sb-link').forEach(function(link) {
    var href = (link.getAttribute('href') || '').trim();
    if (!href) return;
    var inner = iconMap[href];
    if (inner) {
      var svg = link.querySelector('svg.sb-icon');
      if (svg) svg.innerHTML = inner;
    }
  });
}

document.addEventListener('DOMContentLoaded', initSidebar);
document.addEventListener('DOMContentLoaded', updateSidebarIcons);
