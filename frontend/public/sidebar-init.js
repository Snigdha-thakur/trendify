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
  
  try {
    var savedUser = JSON.parse(localStorage.getItem('trendify_user') || 'null');
    if (savedUser) updateSidebarUser(savedUser);
  } catch (e) {}

  // Apply sidebar collapse state from localStorage and set main margin
  var sb = document.getElementById('adminSidebar');
  var main = document.querySelector('.admin-main');
  function updateMainMargin() {
    if (!main) return;
    if (window.innerWidth <= 768) {
      main.style.marginLeft = '0';
      return;
    }
    main.style.marginLeft = sb && sb.classList.contains('collapsed') ? '56px' : '220px';
  }
  function initSidebarState() {
    if (!sb) return;
    if (window.innerWidth <= 768) {
      sb.classList.remove('collapsed');
      var ov = document.getElementById('sbOverlay');
      if (ov) ov.classList.remove('open');
      return;
    }
    try {
      var isCollapsed = localStorage.getItem('adminSidebarCollapsed') === 'true';
      if (isCollapsed) sb.classList.add('collapsed');
    } catch(e) {}
  }
  initSidebarState();
  updateMainMargin();
  window.addEventListener('resize', function() {
    initSidebarState();
    updateMainMargin();
  });
});

function updateSidebarUser(user) {
  if (!user) return;
  var initials = (user.name || 'A').split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  var nameText = user.name || 'Admin';
  var emailText = (user.email && user.email.trim()) || (user.username && user.username.trim()) || user.id || user._id || '';

  document.querySelectorAll('.sb-av').forEach(function(el) { el.textContent = initials; });
  document.querySelectorAll('.sb-name').forEach(function(el) { el.textContent = nameText; });
  document.querySelectorAll('.sb-plan').forEach(function(el) { el.textContent = emailText; });

  document.querySelectorAll('.c-av, #sbAv, #sbAv2').forEach(function(el) { el.textContent = initials; });
  document.querySelectorAll('#sbName, #sbName2').forEach(function(el) { el.textContent = nameText; });
  document.querySelectorAll('#sbEmail, #sbEmail2').forEach(function(el) { el.textContent = emailText; });
}
window.updateSidebarUser = updateSidebarUser;

// Also populate creator sidebar IDs if present
function updateCreatorSidebar(user){
  if(!user) return;
  updateSidebarUser(user);
}
window.updateCreatorSidebar = updateCreatorSidebar;

function toggleSidebar() {
  var sb = document.getElementById('adminSidebar');
  var main = document.querySelector('.admin-main');
  var ov = document.getElementById('sbOverlay');
  if (window.innerWidth <= 768) {
    // On mobile: collapsed = sidebar is visible/open
    sb.classList.toggle('collapsed');
    if (ov) ov.classList.toggle('open', sb.classList.contains('collapsed'));
  } else {
    sb.classList.toggle('collapsed');
    if (ov) ov.classList.remove('open');
    if (main) main.style.marginLeft = sb.classList.contains('collapsed') ? '56px' : '220px';
    try { localStorage.setItem('adminSidebarCollapsed', sb.classList.contains('collapsed')); } catch(e){}
  }
}

function closeSidebarOnMobile() {
  if (window.innerWidth > 768) return;
  var sb = document.getElementById('adminSidebar');
  var ov = document.getElementById('sbOverlay');
  if (sb && sb.classList.contains('collapsed')) {
    sb.classList.remove('collapsed');
    if (ov) ov.classList.remove('open');
  }
}
window.closeSidebarOnMobile = closeSidebarOnMobile;

window.toggleSidebar = toggleSidebar;

function toggleUserMenu(e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  var popup = document.getElementById('userPopup');
  if (!popup) return;
  popup.classList.toggle('open');
}
window.toggleUserMenu = toggleUserMenu;

// Ensure every admin page has a consistent bottom user block and popup
function ensureSidebarUserMarkup() {
  // Remove any page-level sidebar bottom or popup that are not inside the
  // canonical `#adminSidebar` to prevent duplicate user blocks.
  try {
    var adminEl = document.getElementById('adminSidebar');
    document.querySelectorAll('.sb-bottom').forEach(function(el){
      if (!adminEl || !adminEl.contains(el)) el.remove();
    });
    document.querySelectorAll('.sb-user').forEach(function(el){
      if (!adminEl || !adminEl.contains(el)) el.remove();
    });
    // Ensure there's only one element with id userPopup and keep the one
    // inside adminSidebar when possible.
    var allPopups = Array.prototype.slice.call(document.querySelectorAll('#userPopup'));
    if (allPopups.length > 1) {
      for (var k = 0; k < allPopups.length; k++) {
        var p = allPopups[k];
        if (adminEl && adminEl.contains(p)) continue;
        p.remove();
      }
      // refresh list and remove any remaining extras (keep first)
      allPopups = Array.prototype.slice.call(document.querySelectorAll('#userPopup'));
      for (var r = 1; r < allPopups.length; r++) allPopups[r].remove();
    }
  } catch(e) {}
  var sb = document.getElementById('adminSidebar');
  var sbBottom = sb ? sb.querySelector('.sb-bottom') : null;
  if (sb) {
    var allBottoms = sb.querySelectorAll('.sb-bottom');
    if (allBottoms.length > 1) {
      for (var i = 1; i < allBottoms.length; i++) { allBottoms[i].remove(); }
      sbBottom = allBottoms[0];
    }
  }
  // If admin sidebar exists but no sb-bottom, create one so we can normalize across pages
  if (!sbBottom && sb) {
    sbBottom = document.createElement('div'); sbBottom.className = 'sb-bottom'; sb.appendChild(sbBottom);
  }
  if (!sbBottom) {
    // maybe this is a creator page with different sidebar structure
    var cSidebar = document.querySelector('.c-sidebar');
    if (cSidebar) {
      ensureCreatorSidebarUserMarkup(cSidebar);
    }
    return;
  }

  // Remove duplicate bottom users and duplicate popups
  var bottomUsers = sbBottom.querySelectorAll('.sb-user');
  if (bottomUsers.length > 1) {
    for (var j = 1; j < bottomUsers.length; j++) bottomUsers[j].remove();
  }
  var popups = sbBottom.querySelectorAll('#userPopup');
  if (popups.length > 1) {
    for (var j = 1; j < popups.length; j++) popups[j].remove();
  }

  // Normalize main sb-user element
  var sbUser = sbBottom.querySelector('.sb-user');
  if (!sbUser) {
    sbUser = document.createElement('div');
    sbUser.className = 'sb-user';
    sbUser.id = 'sbUser';
    sbBottom.insertBefore(sbUser, sbBottom.firstChild);
  }
  sbUser.onclick = function(e) { e.stopPropagation(); toggleUserMenu(e); };

  // Build inner structure if missing
  if (!sbUser.querySelector('.sb-av')) {
    var av = document.createElement('div'); av.className = 'sb-av'; av.textContent = 'SB'; sbUser.appendChild(av);
  }
  var userInfo = sbUser.querySelector('.sb-user-info');
  if (!userInfo) {
    userInfo = document.createElement('div'); userInfo.className = 'sb-user-info';
    sbUser.appendChild(userInfo);
  }
  if (!userInfo.querySelector('.sb-name')) {
    var name = document.createElement('div'); name.className = 'sb-name'; name.textContent = 'Admin'; userInfo.appendChild(name);
  }
  if (!userInfo.querySelector('.sb-plan')) {
    var plan = document.createElement('div'); plan.className = 'sb-plan'; plan.textContent = ''; userInfo.appendChild(plan);
  }

  // Ensure chevron exists
  if (!sbUser.querySelector('.sb-chevron')) {
    var svg = document.createElement('svg'); svg.className = 'sb-chevron'; svg.setAttribute('width','12'); svg.setAttribute('height','12'); svg.setAttribute('viewBox','0 0 16 16'); svg.setAttribute('fill','currentColor'); svg.innerHTML = '<path d="M4 6l4 4 4-4"/>';
    sbUser.appendChild(svg);
  }

  // Normalize popup
  var popup = sbBottom.querySelector('#userPopup');
  if (!popup) {
    popup = document.getElementById('userPopup');
    if (popup && !sbBottom.contains(popup)) {
      sbBottom.appendChild(popup);
    }
  }
  if (!popup) {
    popup = document.createElement('div'); popup.className = 'user-popup'; popup.id = 'userPopup';
    sbBottom.appendChild(popup);
  } else {
    popup.className = 'user-popup';
    popup.id = 'userPopup';
  }

  // Ensure popup head and actions
  var popupHead = popup.querySelector('.user-popup-head');
  if (!popupHead) {
    popupHead = document.createElement('div'); popupHead.className = 'user-popup-head';
    var av2 = document.createElement('div'); av2.className = 'sb-av'; av2.textContent = 'SB';
    var info2 = document.createElement('div'); info2.className = 'sb-user-info';
    popupHead.appendChild(av2); popupHead.appendChild(info2);
    popup.appendChild(popupHead);
  }
  var popupInfo = popupHead.querySelector('.sb-user-info');
  if (!popupInfo) {
    popupInfo = document.createElement('div'); popupInfo.className = 'sb-user-info';
    popupHead.appendChild(popupInfo);
  }
  if (!popupInfo.querySelector('.sb-name')) {
    var name2 = document.createElement('div'); name2.className = 'sb-name'; name2.textContent = 'Admin'; popupInfo.appendChild(name2);
  }
  if (!popupInfo.querySelector('.sb-plan')) {
    var plan2 = document.createElement('div'); plan2.className = 'sb-plan'; plan2.textContent = ''; popupInfo.appendChild(plan2);
  }

  // Sign-out handler for popup Sign Out link
  popup.querySelectorAll('.user-popup-item[href="../signin.html"]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('trendify_access_token');
      localStorage.removeItem('trendify_user');
      window.location.href = '../signin.html';
    });
  });

  try {
    var savedUser = JSON.parse(localStorage.getItem('trendify_user') || 'null');
    if (savedUser) updateSidebarUser(savedUser);
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', ensureSidebarUserMarkup);

// Close popup on outside click
document.addEventListener('click', function(e) {
  var popup = document.getElementById('userPopup');
  if (!popup || !popup.classList.contains('open')) return;
  if (e.target && e.target.closest && (e.target.closest('#sbUser') || e.target.closest('#userPopup'))) return;
  popup.classList.remove('open');
});

// Creator-specific normalization
function ensureCreatorSidebarUserMarkup(cSidebar){
  if (!cSidebar) cSidebar = document.querySelector('.c-sidebar');
  if (!cSidebar) return;
  var sbBottom = cSidebar.querySelector('.c-sidebar-bottom');
  if (!sbBottom) {
    sbBottom = document.createElement('div'); sbBottom.className = 'c-sidebar-bottom'; cSidebar.appendChild(sbBottom);
  }
  // remove any duplicate creator sidebar user blocks/popup already in the DOM
  var creatorBottomUsers = sbBottom.querySelectorAll('.c-sb-user');
  if (creatorBottomUsers.length > 1) {
    for (var c = 1; c < creatorBottomUsers.length; c++) creatorBottomUsers[c].remove();
  }
  var creatorPopups = sbBottom.querySelectorAll('.c-user-popup');
  if (creatorPopups.length > 1) {
    for (var c2 = 1; c2 < creatorPopups.length; c2++) creatorPopups[c2].remove();
  }
  // user block
  var sbUser = sbBottom.querySelector('.c-sb-user');
  if (!sbUser) {
    sbUser = document.createElement('div'); sbUser.className = 'c-sb-user'; sbUser.id = 'sbUser'; sbUser.setAttribute('onclick','toggleUserMenu(event)');
    var av = document.createElement('div'); av.className = 'c-av'; av.id = 'sbAv'; av.textContent='CR';
    var info = document.createElement('div'); info.style.display='flex'; info.style.flexDirection='column';
    var name = document.createElement('span'); name.className='c-sidebar-label'; name.id='sbName'; name.style.fontSize='12px'; name.style.fontWeight='600';
    var email = document.createElement('span'); email.className='c-sb-email'; email.id='sbEmail'; email.style.fontSize='11px';
    var phone = document.createElement('span'); phone.className='c-sb-email c-sb-phone'; phone.style.fontSize='10px'; phone.textContent='Phone not added';
    var address = document.createElement('span'); address.className='c-sb-email c-sb-address'; address.style.fontSize='10px'; address.textContent='Address not added';
    info.appendChild(name); info.appendChild(email); info.appendChild(phone); info.appendChild(address);
    sbUser.appendChild(av); sbUser.appendChild(info);
    var chev = document.createElement('svg'); chev.setAttribute('style','margin-left:auto;opacity:.5;flex-shrink:0'); chev.setAttribute('width','12'); chev.setAttribute('height','12'); chev.setAttribute('viewBox','0 0 16 16'); chev.setAttribute('fill','currentColor'); chev.innerHTML='<path d="M4 6l4 4 4-4"/>';
    sbUser.appendChild(chev);
    sbBottom.appendChild(sbUser);
  }
  // popup
  var popup = sbBottom.querySelector('.c-user-popup');
  if (!popup) {
    popup = document.createElement('div'); popup.className='c-user-popup'; popup.id='userPopup';
    var head = document.createElement('div'); head.className='c-user-popup-head';
    var av2 = document.createElement('div'); av2.className = 'c-av'; av2.id='sbAv2'; av2.textContent='CR';
    var info2 = document.createElement('div'); var name2 = document.createElement('div'); name2.id='sbName2'; name2.style.fontSize='12px'; name2.style.fontWeight='700'; var email2 = document.createElement('div'); email2.id='sbEmail2'; email2.style.fontSize='10px'; var phone2 = document.createElement('div'); phone2.className='c-sb-phone'; phone2.style.fontSize='10px'; phone2.textContent='Phone not added'; var address2 = document.createElement('div'); address2.className='c-sb-address'; address2.style.fontSize='10px'; address2.textContent='Address not added'; info2.appendChild(name2); info2.appendChild(email2); info2.appendChild(phone2); info2.appendChild(address2);
    head.appendChild(av2); head.appendChild(info2);
    popup.appendChild(head);
    var divider = document.createElement('div'); divider.className='c-user-popup-divider'; popup.appendChild(divider);
    var a1 = document.createElement('a'); a1.className='c-user-popup-item'; a1.href='account-settings.html'; a1.innerHTML='<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6H2z"/></svg>Account Settings';
    var a2 = document.createElement('button'); a2.className='c-user-popup-item'; a2.id='signOutBtn'; a2.innerHTML='<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6"/></svg>Sign Out';
    popup.appendChild(a1); popup.appendChild(a2);
    sbBottom.appendChild(popup);
    // sign out handler
    a2.addEventListener('click', function(){ localStorage.removeItem('trendify_access_token'); localStorage.removeItem('trendify_user'); window.location.href='../signin.html'; });
  }
  // populate if user present
  try { var u = JSON.parse(localStorage.getItem('trendify_user')||'null'); if(u){ updateCreatorSidebar(u); } } catch(e){}
}

// Sidebar section labels kept as-is in HTML

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

// Auto-close sidebar on mobile when a module link is clicked
document.addEventListener('DOMContentLoaded', function() {
  var sb = document.getElementById('adminSidebar');
  if (!sb) return;
  sb.addEventListener('click', function(e) {
    var link = e.target.closest('.sb-link');
    if (link) closeSidebarOnMobile();
  });
  var ov = document.getElementById('sbOverlay');
  if (ov) ov.addEventListener('click', function() { closeSidebarOnMobile(); });
});
