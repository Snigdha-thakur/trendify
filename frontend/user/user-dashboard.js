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
    container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No products available yet.</p>';
    return;
  }
  
  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">';
  
  products.forEach(product => {
    const price = product.discount_price && product.discount_price > 0 
      ? product.discount_price 
      : product.amount;
    
    html += `
      <div style="border:1px solid rgba(167,124,255,.2);border-radius:12px;padding:16px;background:rgba(30,18,68,.5);transition:all .3s ease;">
        ${product.cover_image ? `<img src="${product.cover_image}" alt="${product.name}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:12px;">` : ''}
        <h3 style="font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;">${product.name}</h3>
        <p style="font-size:12px;color:rgba(200,180,255,.7);margin-bottom:12px;line-height:1.4;">${product.description || 'No description'}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-size:18px;font-weight:800;color:#9c5cff;">₹${price}</span>
          <span style="font-size:11px;background:rgba(156,92,255,.2);color:#9c5cff;padding:4px 8px;border-radius:4px;">${product.category || 'Product'}</span>
        </div>
        <button onclick="purchaseProduct('${product.id}')" style="width:100%;padding:10px;background:linear-gradient(135deg,#9c5cff,#6d28d9);border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;transition:all .2s ease;">
          Purchase Now
        </button>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function purchaseProduct(productId) {
  // Redirect to product page or payment
  window.location.href = `/product.html?id=${productId}`;
}

// Load products on page load
document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();
  renderProducts(products);
});
