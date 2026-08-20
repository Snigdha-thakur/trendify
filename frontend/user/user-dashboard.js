/**
 * User Dashboard — Load and display products in table
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
  const tbody = document.getElementById('productsTableBody');
  const paginationInfo = document.getElementById('paginationInfo');
  
  if (!tbody) return;
  
  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--smoke);">No products available</td></tr>';
    paginationInfo.innerHTML = '<span>No products available</span>';
    return;
  }
  
  let html = '';
  products.forEach(product => {
    const price = product.discount_price && product.discount_price > 0 
      ? product.discount_price 
      : product.amount;
    
    html += `
      <tr>
        <td>${product.name}</td>
        <td><span class="badge-type badge-digital">${product.category || 'Product'}</span></td>
        <td style="font-family:var(--f-mono);color:var(--white);font-weight:600">₹${parseFloat(price).toLocaleString('en-IN')}</td>
        <td><button onclick="purchaseProduct('${product.id}')" style="background:var(--iris);color:#fff;border:none;padding:6px 14px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--f-sans);transition:background .2s;">Purchase</button></td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  paginationInfo.innerHTML = `<span>Showing ${products.length} of ${products.length} products</span>`;
}

function purchaseProduct(productId) {
  window.location.href = `/product.html?id=${productId}`;
}

// Load products on page load
document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();
  renderProducts(products);
});
