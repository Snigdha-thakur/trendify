(function(){
  let base = 'https://trendify-pxkx.onrender.com/api';
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    base = 'http://localhost:8000/api';
  } else if (window.__API_URL__) {
    base = String(window.__API_URL__).replace(/\/+$|\s+$/g, '') + '/api';
  }
  const KEY='trendify_access_token';
  function tok(){return localStorage.getItem(KEY);}
  async function req(method,url,body){
    const t=tok();
    if(!t){location.href='../signin.html';throw new Error('No token');}
    const opts={method,headers:{'Authorization':'Bearer '+t,'Content-Type':'application/json'}};
    if(body) opts.body=JSON.stringify(body);
    const r=await fetch(base+url,opts);
    if(r.status===401||r.status===403){location.href='../signin.html';throw new Error('Unauthorized');}
    if(!r.ok){const t2=await r.text();throw new Error(t2);}
    return r.json();
  }
  window.CreatorAPI={
    getTransactions:()=>req('GET','/payments/transactions'),
    getWalletBalance:()=>req('GET','/wallets/balance'),
    getWalletLogs:(skip=0,limit=500)=>req('GET',`/wallets/logs?skip=${skip}&limit=${limit}`),
    getPayouts:()=>req('GET','/wallets/payouts'),
    requestWithdraw:(amount,payout_type)=>req('POST',`/wallets/withdraw?amount=${amount}&payout_type=${payout_type}`),
    getProducts:()=>req('GET','/products/my'),
    createProduct:(data)=>req('POST','/products/',data),
    updateProduct:(id,data)=>req('PUT',`/products/${id}`,data),
    deleteProduct:(id)=>req('DELETE',`/products/${id}`),
    getCoupons:()=>req('GET','/coupons/my'),
    createCoupon:(data)=>req('POST','/coupons/',data),
    updateCoupon:(id,data)=>req('PUT',`/coupons/${id}`,data),
    deleteCoupon:(id)=>req('DELETE',`/coupons/${id}`),
    verifyTransaction:(id)=>req('POST',`/payments/transactions/${id}/verify`),
    getReferralEarnings:()=>req('GET','/wallets/referral-earnings'),
    getAudience:()=>req('GET','/payments/transactions'),
  };
})();
