/**
 * User Dashboard — Load and display products
 */

let baseAPI = '/api';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  baseAPI = 'http://localhost:8000/api';
}

async function loadProducts() {
  try {
    const res = await fetch(`${baseAPI}/products/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      console.error('Failed to load products:', res.status);
      return [];
    }
    
    const products = await res.json();
    return products;
  } catch (err) {
    console.error('Error loading products:', err);
    return [];
  }
}

function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  if (!container) return;
  
  if (!products || products.length === 0) {
    container.innerHTML = '<div class="c-empty" style="grid-column:1/-1;">No products available yet.</div>';
    return;
  }
  
  let html = '';
  
  products.forEach(product => {
    const price = product.discount_price && product.discount_price > 0 
      ? product.discount_price 
      : product.amount;
    
    const coverImage = product.cover_image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22160%22%3E%3Crect fill=%22%231e1e3a%22 width=%22280%22 height=%22160%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Syne%22 font-size=%2216%22 fill=%22%239d99bb%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EProduct Image%3C/text%3E%3C/svg%3E';
    
    html += `
      <div class="c-stat-card" style="display:flex;flex-direction:column;gap:12px;padding:0;overflow:hidden;transition:all .2s;">
        <img src="${coverImage}" alt="${product.name}" style="width:100%;height:160px;object-fit:cover;background:#1e1e3a;"/>
        <div style="padding:16px;display:flex;flex-direction:column;gap:8px;flex:1;">
          <h3 style="font-size:15px;font-weight:700;color:#f2f0ff;margin:0;line-height:1.3;">${product.name}</h3>
          <p style="font-size:12px;color:#9d99bb;margin:0;line-height:1.4;flex:1;">${product.description || 'Premium digital product'}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;">
            <span style="font-size:18px;font-weight:700;color:#a67cff;">₹${parseFloat(price).toLocaleString('en-IN')}</span>
            <span style="font-size:11px;background:rgba(166,124,255,.15);color:#a67cff;padding:4px 10px;border-radius:20px;font-family:'DM Mono',monospace;">${product.category || 'Product'}</span>
          </div>
          <button onclick="purchaseProduct('${product.id}')" style="width:100%;padding:10px;background:linear-gradient(135deg,#a67cff,#7b5ea7);border:none;border-radius:6px;color:#fff;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;font-size:13px;transition:opacity .2s;margin-top:8px;">
            Purchase Now
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function purchaseProduct(productId) {
  window.location.href = `/product.html?id=${productId}`;
}

// Load products on page load
document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();
  renderProducts(products);
});
