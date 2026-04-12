// Admin Dashboard with Backend Authentication
(function(){
  const authKey = 'adminToken';
  const userKey = 'adminUser';
  const API_URL = 'http://localhost:5000/api';

  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const logoutBtn = document.getElementById('logoutBtn');
  const toastEl = document.getElementById('toast');

  const invoiceListEl = document.getElementById('invoice-list');
  const menuListEl = document.getElementById('menu-list');
  const ordersListEl = document.getElementById('orders-list');

  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));

  // Sample data
  const invoices = [
    { id:1, invoiceNumber:'INV-001', tableNumber:4, items:[{name:'Burger',quantity:2,price:9.5},{name:'Frites',quantity:1,price:3}], totalPrice:22.0, date:'2026-02-20', time:'12:45'},
    { id:2, invoiceNumber:'INV-002', tableNumber:2, items:[{name:'Pizza',quantity:1,price:12},{name:'Coca',quantity:2,price:2.5}], totalPrice:17.0, date:'2026-02-20', time:'13:10'}
  ];

  const menuItems = [
    { id:1, name:'Burger Classique', description:'Bœuf, fromage, salade', price:9.5, category:'Burgers' },
    { id:2, name:'Pizza Margherita', description:'Tomate, mozzarella, basilic', price:12, category:'Pizzas' }
  ];

  const orders = [
    { id:1, table:3, summary:'1x Burger, 1x Frites', status:'Servi' },
    { id:2, table:5, summary:'2x Pizza', status:'En préparation' }
  ];

  function showToast(msg, ms=2500){
    toastEl.textContent = msg; toastEl.classList.remove('hidden');
    setTimeout(()=>toastEl.classList.add('hidden'), ms);
  }

  function renderInvoices(){
    invoiceListEl.innerHTML = '';
    invoices.forEach(inv=>{
      const el = document.createElement('div'); el.className = 'card-item';
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700">Facture ${inv.invoiceNumber}</div>
            <div style="color:#6b7280;font-size:13px">Table ${inv.tableNumber} • ${inv.date} ${inv.time}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700;color:var(--orange)">${inv.totalPrice.toFixed(2)} €</div>
            <div style="margin-top:8px">
              <button data-id="${inv.id}" class="btn-print">Imprimer</button>
            </div>
          </div>
        </div>
      `;
      invoiceListEl.appendChild(el);
    });

    // attach print handlers
    document.querySelectorAll('.btn-print').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = Number(btn.getAttribute('data-id'));
        const invoice = invoices.find(i=>i.id===id);
        if(!invoice){ showToast('Facture introuvable'); return; }
        openPrintWindow(invoice);
      });
    });
  }

  function openPrintWindow(invoice){
    const printWindow = window.open('', '', 'width=800,height=600');
    if(!printWindow){ showToast("Autorisez les popups pour imprimer"); return; }
    const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Facture ${invoice.invoiceNumber}</title>
      <style>body{font-family:Arial;padding:30px}h1{color:${getComputedStyle(document.documentElement).getPropertyValue('--orange')||'#f97316'}}</style>
      </head><body>
      <h1>Facture ${invoice.invoiceNumber}</h1>
      <p>Table ${invoice.tableNumber} — ${invoice.date} ${invoice.time}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:20px">
      <thead><tr><th style="text-align:left;border-bottom:1px solid #eee">Article</th><th style="text-align:center;border-bottom:1px solid #eee">Qté</th><th style="text-align:right;border-bottom:1px solid #eee">Total</th></tr></thead>
      <tbody>${invoice.items.map(it=>`<tr><td>${it.name}</td><td style=\"text-align:center\">${it.quantity}</td><td style=\"text-align:right\">${(it.quantity*it.price).toFixed(2)} €</td></tr>`).join('')}</tbody>
      <tfoot><tr><td></td><td style="text-align:right;font-weight:700">TOTAL</td><td style="text-align:right;font-weight:700">${invoice.totalPrice.toFixed(2)} €</td></tr></tfoot>
      </table>
      </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(()=>{ printWindow.print(); showToast('Envoie à l\'imprimante'); }, 300);
  }

  function renderMenu(){
    menuListEl.innerHTML = '';
    menuItems.forEach(item=>{
      const el = document.createElement('div'); el.className='card-item';
      el.innerHTML = `<div style=\"display:flex;justify-content:space-between;align-items:center\"><div><div style=\"font-weight:700\">${item.name}</div><div style=\"color:#6b7280;font-size:13px\">${item.description}</div></div><div style=\"color:var(--orange);font-weight:700\">${item.price.toFixed(2)} €</div></div>`;
      menuListEl.appendChild(el);
    });
  }

  function renderOrders(){
    ordersListEl.innerHTML = '';
    orders.forEach(o=>{
      const el = document.createElement('div'); el.className='card-item';
      el.innerHTML = `<div style=\"display:flex;justify-content:space-between;align-items:center\"><div><div style=\"font-weight:700\">Table ${o.table}</div><div style=\"color:#6b7280;font-size:13px\">${o.summary}</div></div><div style=\"font-size:13px;color:#374151\">${o.status}</div></div>`;
      ordersListEl.appendChild(el);
    });
  }

  function showDashboard(){
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    renderInvoices(); renderMenu(); renderOrders();
  }

  function showLogin(){
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }

  // Tabs
  tabs.forEach(t=>t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const target = t.getAttribute('data-tab');
    panels.forEach(p=>p.classList.add('hidden'));
    document.getElementById(target).classList.remove('hidden');
  }));

  // Login handler - call backend API
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if(!username || !password){ 
      showToast('Remplissez tous les champs'); 
      return; 
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Erreur de connexion');
        return;
      }

      // Save token and user info
      localStorage.setItem(authKey, data.token);
      localStorage.setItem(userKey, JSON.stringify(data.user));
      
      showToast('Connexion réussie');
      usernameInput.value = '';
      passwordInput.value = '';
      
      setTimeout(showDashboard, 400);
    } catch (err) {
      console.error('Erreur:', err);
      showToast('Erreur de connexion au serveur');
    }
  });

  logoutBtn.addEventListener('click', async ()=>{
    try {
      const token = localStorage.getItem(authKey);
      
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Clear stored data regardless of response
      localStorage.removeItem(authKey);
      localStorage.removeItem(userKey);
      
      showLogin();
      showToast('Déconnecté avec succès');
    } catch (err) {
      console.error('Erreur:', err);
      // Still clear local data even if API call fails
      localStorage.removeItem(authKey);
      localStorage.removeItem(userKey);
      showLogin();
      showToast('Déconnecté');
    }
  });

  // Auto-login if token exists
  if(localStorage.getItem(authKey)) {
    showDashboard();
  }
})();
