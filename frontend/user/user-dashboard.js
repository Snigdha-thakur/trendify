/**
 * User Dashboard — Load and display user's purchased orders in real-time
 */

let baseAPI = '/api';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  baseAPI = 'http://localhost:8000/api';
}

async function loadUserOrders() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      return [];
    }

    const res = await fetch(`${baseAPI}/payments/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!res.ok) {
      console.error('Failed to load orders:', res.status);
      return [];
    }
    
    const orders = await res.json();
    return orders;
  } catch (err) {
    console.error('Error loading orders:', err);
    return [];
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('productsTableBody');
  const paginationInfo = document.getElementById('paginationInfo');
  
  if (!tbody) return;
  
  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--smoke);">No orders yet. Start shopping!</td></tr>';
    paginationInfo.innerHTML = '<span>No orders available</span>';
    return;
  }
  
  let html = '';
  orders.forEach((order, index) => {
    const date = new Date(order.created_at).toLocaleDateString('en-IN');
    const status = order.status || 'Pending';
    const statusClass = status === 'Success' ? 'badge-success' : status === 'Failed' ? 'badge-failed' : 'badge-pending';
    const productName = order.product_name || 'Unknown Product';
    const amount = parseFloat(order.amount || 0);
    
    html += `
      <tr>
        <td>${date}</td>
        <td>${productName}</td>
        <td><span class="badge-type ${statusClass}">${status}</span></td>
        <td style="font-family:var(--f-mono);color:var(--white);font-weight:600">₹${amount.toLocaleString('en-IN')}</td>
        <td>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button onclick="viewOrder('${order.id}', '${order.product_id}', '${status}')" class="action-btn action-btn-access" title="View Order">View Order</button>
            ${status === 'Success' ? `<button onclick="downloadReceipt('${order.id}', '${productName}', '${amount}')" class="action-btn action-btn-pricing" title="Download Receipt">Receipt</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  paginationInfo.innerHTML = `<span>Showing ${orders.length} of ${orders.length} orders</span> <span style="margin:0 16px">1 / 1</span>`;
}

function viewOrder(orderId, productId, status) {
  if (status === 'Success') {
    window.location.href = `/product-preview.html?id=${productId}&order_id=${orderId}`;
  } else {
    alert(`Order status: ${status}. Please complete the payment to access the product.`);
  }
}

function downloadReceipt(orderId, productName, amount) {
  // Generate and download receipt
  const receipt = `
Order Receipt
=============
Order ID: ${orderId}
Product: ${productName}
Amount: ₹${parseFloat(amount).toLocaleString('en-IN')}
Date: ${new Date().toLocaleDateString('en-IN')}

Thank you for your purchase!
  `.trim();
  
  const blob = new Blob([receipt], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${orderId}.txt`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Refresh orders every 5 seconds for real-time updates
let refreshInterval;

async function startRealTimeUpdates() {
  const orders = await loadUserOrders();
  renderOrders(orders);
  
  refreshInterval = setInterval(async () => {
    const updatedOrders = await loadUserOrders();
    renderOrders(updatedOrders);
  }, 5000);
}

// Load orders on page load
document.addEventListener('DOMContentLoaded', async () => {
  await startRealTimeUpdates();
});

// Clean up interval on page unload
window.addEventListener('beforeunload', () => {
  if (refreshInterval) clearInterval(refreshInterval);
});
