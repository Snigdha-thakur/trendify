/**
 * UI Helpers & Utilities
 * Common functions for UI interactions
 */

/**
 * Show notification toast
 */
export function showNotification(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `notification notification--${type}`;
  toast.innerHTML = `
    <div class="notification__content">
      <p>${message}</p>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, duration);
}

/**
 * Show error
 */
export function showError(message) {
  showNotification(message, 'error', 5000);
}

/**
 * Show success
 */
export function showSuccess(message) {
  showNotification(message, 'success', 3000);
}

/**
 * Show loading state
 */
export function showLoading(element) {
  if (!element) return;
  element.classList.add('loading');
  element.disabled = true;
}

/**
 * Hide loading state
 */
export function hideLoading(element) {
  if (!element) return;
  element.classList.remove('loading');
  element.disabled = false;
}

/**
 * Format price
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text
 */
export function truncateText(text, length = 100) {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
}

/**
 * Validate email
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password
 */
export function validatePassword(password) {
  return password.length >= 8;
}

/**
 * Get query parameter
 */
export function getQueryParam(param) {
  const url = new URL(window.location);
  return url.searchParams.get(param);
}

/**
 * Redirect to page
 */
export function redirectTo(url) {
  window.location.href = url;
}

/**
 * Encode form data
 */
export function encodeFormData(data) {
  return new URLSearchParams(data).toString();
}

/**
 * Create element
 */
export function createElement(tag, attributes = {}, innerHTML = '') {
  const element = document.createElement(tag);
  
  Object.keys(attributes).forEach(key => {
    if (key === 'class') {
      element.className = attributes[key];
    } else if (key === 'style') {
      Object.assign(element.style, attributes[key]);
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });
  
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  
  return element;
}

/**
 * Download file
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

/**
 * Debounce function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    }
  };
}

export default {
  showNotification,
  showError,
  showSuccess,
  showLoading,
  hideLoading,
  formatPrice,
  formatDate,
  truncateText,
  validateEmail,
  validatePassword,
  getQueryParam,
  redirectTo,
  encodeFormData,
  createElement,
  downloadFile,
  copyToClipboard,
  debounce,
  throttle,
};
