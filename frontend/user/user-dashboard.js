/**
 * User Dashboard — Load and display products in table with action buttons
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
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--smoke);">No products available</td></tr>';
    paginationInfo.innerHTML = '<span>No products available</span>';
    return;
  }
  
  let html = '';
  products.forEach((product, index) => {
    const price = product.discount_price && product.discount_price > 0 
      ? product.discount_price 
      : product.amount;
    
    const date = new Date(product.created_at).toLocaleDateString('en-IN');
    
    html += `
      <tr>
        <td>${date}</td>
        <td>${product.name}</td>
        <td><span class="badge-type badge-digital">${product.category || 'Digital Product'}</span></td>
        <td style="font-family:var(--f-mono);color:var(--white);font-weight:600">₹${parseFloat(price).toLocaleString('en-IN')}</td>
        <td>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button onclick="accessTools('${product.id}')" class="action-btn action-btn-access" title="Access Tools">Access Tools</button>
            <button onclick="getPricing('${product.id}')" class="action-btn action-btn-pricing" title="Get Pricing">Get Pricing</button>
            <button onclick="purchaseProduct('${product.id}')" class="action-btn action-btn-purchase" title="Purchase">Purchase</button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  paginationInfo.innerHTML = `<span>Showing ${products.length} of ${products.length} products</span> <span style="margin:0 16px">1 / 1</span>`;
}

function accessTools(productId) {
  // Redirect to product page to access tools
  window.location.href = `/product.html?id=${productId}&tab=tools`;
}

function getPricing(productId) {
  // Show pricing details modal or redirect to pricing page
  window.location.href = `/product.html?id=${productId}&tab=pricing`;
}

function purchaseProduct(productId) {
  // Redirect to product page for purchase
  window.location.href = `/product.html?id=${productId}&tab=purchase`;
}

// Load products on page load
document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();
  renderProducts(products);
});
