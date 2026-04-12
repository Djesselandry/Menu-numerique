
    // Configuration du serveur - Gestion automatique de l'URL
    let SERVER_URL = window.location.origin;
    
    // En développement local, utiliser l'IP locale
    if (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1') {
      // Le serveur servira depuis la racine
      SERVER_URL = window.location.origin;
    }

    // Socket.io initialization
    const socket = io(SERVER_URL);
    
    // Data
    async function loadMenuFromAPI() {
  try {
    const res = await fetch(SERVER_URL + "/api/menu");
    const data = await res.json();

    // Adapter les données backend → frontend
    menuItems = data
      .filter(item => item.is_active) // Ne garder que les articles actifs
      .map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || "Description non disponible",
      price: Number(item.price),
      image: item.image_url ? SERVER_URL + `/uploads${item.image_url}` : SERVER_URL + '/assets/images/placeholder.png',
      category: item.category || "Tous",
      popular: item.popular || false
    }));

    updateCategories();
    renderMenu();
    renderCategories();
  } catch (error) {
    console.error("Erreur chargement menu :", error);
    showToast("Impossible de charger le menu", "error");
  }
}

    let menuItems = [];
    let categories = ['Tous'];

    // State
    let cart = [];
    let selectedCategory = 'Tous';
    let activeOrderId = null;
    let pollingInterval = null;
    let lastOrderStatus = null;
    let audioCtx = null;
    let tableIdFromUrl = null;
    let currentTableNumber = null;
    let currentQRCode = null;

    // Initialiser avec le code QR depuis l'URL
    function initializeFromQR() {
      const urlParams = new URLSearchParams(window.location.search);
      const qrCode = urlParams.get('qr');
      
      if (qrCode) {
        currentQRCode = qrCode;
        // Optionnel: extraire le numéro de table du code QR si au format TABLE_X
        const tableMatch = qrCode.match(/TABLE_(\d+)/i) || qrCode.match(/(\d+)/);
        if (tableMatch) {
          currentTableNumber = parseInt(tableMatch[1]);
          tableIdFromUrl = currentTableNumber; // Pour compatibilité avec le code existant
        }
        console.log('Code QR détecté:', qrCode, 'Table:', currentTableNumber);
      }
    }

    // Icons SVG
    const icons = {
      plus: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
      minus: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
      trash: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
      home: '<svg class="icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      chef: '<svg class="icon" viewBox="0 0 24 24"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>',
      pizza: '<svg class="icon" viewBox="0 0 24 24"><path d="M15 11h.01"/><path d="M11 15h.01"/><path d="M16 16h.01"/><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"/><path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"/></svg>',
      utensils: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
      salad: '<svg class="icon" viewBox="0 0 24 24"><path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/></svg>',
      icecream: '<svg class="icon" viewBox="0 0 24 24"><path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11"/><path d="M17 7A5 5 0 0 0 7 7"/><path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4"/></svg>',
    };

    const categoryIcons = {
      'Tous': icons.home,
      'Burgers': icons.chef,
      'Pizzas': icons.pizza,
      'Pâtes': icons.utensils,
      'Salades': icons.salad,
      'Sushi': icons.utensils,
      'Desserts': icons.icecream,
    };

    // Functions
    function updateCategories() {
      // Extraire les catégories uniques depuis les menuItems
      const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
      categories = ['Tous', ...uniqueCategories.filter(cat => cat !== 'Tous')];
    }

    function getFilteredItems() {
      return selectedCategory === 'Tous' 
        ? menuItems 
        : menuItems.filter(item => item.category === selectedCategory);
    }

    function getItemQuantity(itemId) {
      const cartItem = cart.find(c => c.item.id === itemId);
      return cartItem ? cartItem.quantity : 0;
    }

    function addToCart(item) {
      const existingItem = cart.find(c => c.item.id === item.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ item, quantity: 1 });
      }
      showToast(`${item.name} ajouté au panier`, 'success');
      renderMenu();
      renderCart();
      updateCartBar();
    }

    function removeFromCart(itemId) {
      const existingItem = cart.find(c => c.item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity--;
      } else {
        cart = cart.filter(c => c.item.id !== itemId);
      }
      renderMenu();
      renderCart();
      updateCartBar();
    }

    function removeItemCompletely(itemId) {
      cart = cart.filter(c => c.item.id !== itemId);
      showToast('Article retiré du panier', 'info');
      renderCart();
      updateCartBar();
    }

    function handleOrder() {
      if (cart.length === 0) {
        showToast('Votre panier est vide', 'info');
        return;
      }

      if (tableIdFromUrl) {
        // Si l'ID de la table vient du QR code, on commande directement
        submitOrder(tableIdFromUrl);
      } else {
        // Sinon, on demande le numéro de table
        openTableModal();
      }
    }

    function submitOrder(prefilledTableId = null) {
      // Initialiser l'audio sur l'interaction utilisateur (clic bouton)
      initAudio();

      let tableId;

      if (prefilledTableId) {
        tableId = prefilledTableId;
      } else {
        // Cas où la modale est utilisée
        const tableInput = document.getElementById('tableNumberInput');
        tableId = tableInput.value;

        if (!tableId || parseInt(tableId) <= 0) {
          showToast('Veuillez entrer un numéro de table valide', 'error');
          return;
        }
      }

      // Prepare the order data
      const orderData = {
        table_id: parseInt(tableId),
        items: cart.map(cartItem => ({
          menu_id: cartItem.item.id,
          quantity: cartItem.quantity,
          unit_price: cartItem.item.price,
          subtotal: cartItem.item.price * cartItem.quantity
        })),
        total: getTotalPrice()
      };
    
      // Send the order data to the backend
      fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        showToast('Commande confirmée ! Merci pour votre achat 🎉', 'success');
        cart = [];
        if (!prefilledTableId) {
          closeTableModal();
        }
        closeCartDrawer();
        renderMenu();
        updateCartBar();
        
        if (data.id) {
            startOrderPolling(data.id);
        }
      })
      .catch(error => {
        console.error('Error placing order:', error);
        showToast('Erreur lors de la commande', 'error');
      });
    }

    function startOrderPolling(orderId) {
      if (pollingInterval) clearInterval(pollingInterval);
      lastOrderStatus = 'PENDING';
      
      // Vérifier le statut toutes les 3 secondes
      pollingInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          if (!res.ok) return;
          const order = await res.json();
          
          if (order.status === 'PREPARING' && lastOrderStatus !== 'PREPARING') {
            playNotificationSound();
            showToast('👨‍🍳 Votre commande est en préparation !', 'success');
            lastOrderStatus = 'PREPARING';
          } else if (order.status === 'SERVED' && lastOrderStatus !== 'SERVED') {
            playNotificationSound();
            showToast('✅ Votre commande est servie ! Bon appétit !', 'success');
            lastOrderStatus = 'SERVED';
            clearInterval(pollingInterval); // Arrêter de vérifier une fois servi
          }
        } catch (err) {
          console.error("Erreur polling", err);
        }
      }, 3000);
    }

    function initAudio() {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioCtx = new AudioContext();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playNotificationSound() {
      if (!audioCtx) initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // Son de notification (Ding)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // Do (C5)
      osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1); // Monte d'une octave
      
      // Volume plus fort
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    }

    function getTableIdFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      const tableId = urlParams.get('table');
      if (tableId && !isNaN(parseInt(tableId))) {
        console.log(`Table ID ${tableId} détecté depuis l'URL.`);
        return parseInt(tableId);
      }
      return null;
    }

    function initTableModal() {
      // Styles pour la modale
      const style = document.createElement('style');
      style.textContent = `
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5); z-index: 2000;
          display: none; justify-content: center; align-items: center;
        }
        .modal-overlay.visible { display: flex; }
        .modal-card {
          background: white; padding: 2rem; border-radius: 1rem;
          width: 90%; max-width: 400px; text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .table-input {
          width: 100%; padding: 0.75rem; margin: 1rem 0;
          border: 1px solid #ddd; border-radius: 0.5rem;
          font-size: 1.1rem; text-align: center;
        }
        .modal-actions { display: flex; gap: 1rem; justify-content: center; }
        .btn-confirm { background: #f97316; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold; }
        .btn-cancel { background: #e5e7eb; color: #374151; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold; }
      `;
      document.head.appendChild(style);

      // HTML pour la modale
      const modalHTML = `
        <div id="tableModal" class="modal-overlay">
          <div class="modal-card">
            <h3>Numéro de table</h3>
            <p>Veuillez entrer votre numéro de table</p>
            <input type="number" id="tableNumberInput" class="table-input" placeholder="Ex: 5" min="1">
            <div class="modal-actions">
              <button class="btn-cancel" onclick="closeTableModal()">Annuler</button>
              <button class="btn-confirm" onclick="submitOrder()">Valider</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function openTableModal() {
      document.getElementById('tableModal').classList.add('visible');
      setTimeout(() => document.getElementById('tableNumberInput').focus(), 100);
    }

    function closeTableModal() {
      document.getElementById('tableModal').classList.remove('visible');
      document.getElementById('tableNumberInput').value = '';
    }

    function openTableModal() {
      document.getElementById('tableModal').classList.add('visible');
      document.getElementById('overlay').classList.add('visible');
      document.getElementById('tableNumberInput').value = '';
      document.getElementById('tableNumberInput').focus();
    }

    function closeTableModal() {
      document.getElementById('tableModal').classList.remove('visible');
      document.getElementById('overlay').classList.remove('visible');
    }

    async function submitOrder() {
      let tableNumber = null;
      let qrCode = null;

      // Si le client a un code QR, l'utiliser
      if (currentQRCode) {
        qrCode = currentQRCode;
        tableNumber = currentTableNumber;
      } else {
        // Sinon, obtenir le numéro de table depuis le modal
        tableNumber = parseInt(document.getElementById('tableNumberInput').value, 10);
        
        if (!tableNumber || tableNumber <= 0) {
          showToast('Veuillez entrer un numéro de table valide', 'error');
          return;
        }
      }

      try {
        // Préparer les données de la commande
        const orderData = {
          items: cart.map(cartItem => ({
            id: cartItem.item.id,
            name: cartItem.item.name,
            price: cartItem.item.price,
            quantity: cartItem.quantity
          }))
        };

        // Ajouter soit le code QR soit le numéro de table
        if (qrCode) {
          orderData.qrCode = qrCode;
        } else {
          orderData.tableNumber = tableNumber;
        }

        // Envoyer la commande au serveur
        const response = await fetch(SERVER_URL + '/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la soumission de la commande');
        }

        const result = await response.json();
        
        currentTableNumber = tableNumber;
        closeTableModal();
        closeCartDrawer();
        cart = [];
        renderMenu();
        updateCartBar();
        
        // Émettre l'événement socket pour notifier l'admin
        socket.emit('new_order', {
          table_number: tableNumber,
          items: orderData.items,
          total: result.total || orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
        
        showToast(`✓ Commande confirmée pour la table ${tableNumber}!`, 'success');
      } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la soumission de la commande', 'error');
      }
    }

    // Permettre Enter pour soumettre le formulaire
    document.addEventListener('DOMContentLoaded', () => {
      // Initialiser avec le code QR depuis l'URL
      initializeFromQR();
      
      // Charger le menu
      loadMenuFromAPI();
      
      const tableInput = document.getElementById('tableNumberInput');
      if (tableInput) {
        tableInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            submitOrder();
          }
        });
      }
    });

    function getTotalItems() {
      return cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    }

    function getTotalPrice() {
      return cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);
    }

    function renderMenu() {
      const grid = document.getElementById('menuGrid');
      const items = getFilteredItems();

      grid.innerHTML = items.map(item => {
        const quantity = getItemQuantity(item.id);
        return `
          <div class="menu-card">
            <div class="card-image-container" style="height: auto;">
              <img src="${item.image}" alt="${item.name}" class="card-image" style="width: 100%; height: auto; display: block;">
              ${item.popular ? '<div class="popular-badge">Populaire</div>' : ''}
            </div>
            <div class="card-content">
              <div class="card-header">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-description">${item.description}</p>
              </div>
              <div class="card-footer">
                <span class="card-price">${item.price.toFixed(2)} fbu</span>
                ${quantity === 0 ? `
                  <button class="add-btn" onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    ${icons.plus}
                    Ajouter
                  </button>
                ` : `
                  <div class="quantity-controls">
                    <button class="quantity-btn" onclick="removeFromCart(${item.id})">
                      ${icons.minus}
                    </button>
                    <span class="quantity-display">${quantity}</span>
                    <button class="quantity-btn" onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                      ${icons.plus}
                    </button>
                  </div>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderCart() {
      const content = document.getElementById('cartContent');
      const footer = document.getElementById('cartFooter');
      const badge = document.getElementById('drawerItemCount');
      
      const totalItems = getTotalItems();
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'inline' : 'none';
      
      if (cart.length === 0) {
        content.innerHTML = `
          <div class="empty-cart">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <p>Votre panier est vide</p>
          </div>
        `;
        footer.innerHTML = '';
      } else {
        content.innerHTML = `
          <div class="cart-items">
            ${cart.map(cartItem => `
              <div class="cart-item">
                <img src="${cartItem.item.image}" alt="${cartItem.item.name}" class="cart-item-image">
                <div class="cart-item-info">
                  <h3 class="cart-item-name">${cartItem.item.name}</h3>
                  <p class="cart-item-price">${cartItem.item.price.toFixed(2)} fbu</p>
                  <div class="cart-quantity-controls">
                    <button class="quantity-btn-sm" onclick="removeFromCart(${cartItem.item.id})">
                      ${icons.minus}
                    </button>
                    <span class="quantity-display">${cartItem.quantity}</span>
                    <button class="quantity-btn-sm" onclick="addToCart(${JSON.stringify(cartItem.item).replace(/"/g, '&quot;')})">
                      ${icons.plus}
                    </button>
                  </div>
                </div>
                <div class="cart-item-right">
                  <p class="cart-item-total">${(cartItem.item.price * cartItem.quantity).toFixed(2)} fbu</p>
                  <button class="delete-btn" onclick="removeItemCompletely(${cartItem.item.id})">
                    ${icons.trash}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        
        const total = getTotalPrice();
        footer.innerHTML = `
          <div class="total-row">
            <span class="total-label">Total</span>
            <span class="total-amount">${total.toFixed(2)} fbu</span>
          </div>
          <button class="order-btn" onclick="handleOrder()">Commander maintenant</button>
        `;
      }
    }

    function updateCartBar() {
      const cartBar = document.getElementById('cartBar');
      const totalItems = getTotalItems();
      const totalPrice = getTotalPrice();
      
      if (totalItems > 0) {
        cartBar.classList.add('visible');
        document.getElementById('cartItemsCount').textContent = `${totalItems} article${totalItems > 1 ? 's' : ''}`;
        document.getElementById('cartTotalPrice').textContent = `${totalPrice.toFixed(2)} fbu`;
      } else {
        cartBar.classList.remove('visible');
      }
    }

    function renderCategories() {
      const list = document.getElementById('categoriesList');
      list.innerHTML = categories.map(category => {
        const isSelected = selectedCategory === category;
        // Utiliser l'icône de la catégorie ou un fallback pour les catégories personnalisées
        const icon = categoryIcons[category] || icons.utensils;
        return `
          <button 
            class="category-btn ${isSelected ? 'active' : ''}" 
            onclick="selectCategory('${category}')"
          >
            ${icon}
            <span>${category}</span>
          </button>
        `;
      }).join('');
    }

    function selectCategory(category) {
      selectedCategory = category;
      closeNavDrawer();
      renderMenu();
      renderCategories();
    }

    function openCartDrawer() {
      document.getElementById('overlay').classList.add('visible');
      document.getElementById('cartDrawer').classList.add('visible');
      renderCart();
    }

    function closeCartDrawer() {
      document.getElementById('overlay').classList.remove('visible');
      document.getElementById('cartDrawer').classList.remove('visible');
    }

    function openNavDrawer() {
      document.getElementById('overlay').classList.add('visible');
      document.getElementById('navDrawer').classList.add('visible');
      renderCategories();
    }

    function closeNavDrawer() {
      document.getElementById('overlay').classList.remove('visible');
      document.getElementById('navDrawer').classList.remove('visible');
    }

    function closeAllDrawers() {
      closeCartDrawer();
      closeNavDrawer();
    }

    // Fonction pour jouer un son de notification
    function playNotificationSound(type = 'success') {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        if (type === 'success') {
          // Son de succès: deux bips montants
          const osc1 = audioContext.createOscillator();
          const osc2 = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioContext.destination);
          
          osc1.frequency.setValueAtTime(800, now);
          osc2.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          
          osc1.start(now);
          osc2.start(now + 0.1);
          osc1.stop(now + 0.15);
          osc2.stop(now + 0.3);
        } else if (type === 'error') {
          // Son d'erreur: bip grave
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.setValueAtTime(300, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          
          osc.start(now);
          osc.stop(now + 0.3);
        }
      } catch (err) {
        console.log('Son non disponible');
      }
    }

    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');
      
      toast.className = `toast ${type} visible`;
      toastMessage.textContent = message;
      
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 3000);
    }

    // Fonction pour jouer un son d'alerte pour les notifications de commande
    function playOrderStatusSound() {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        // Double alerte pour notification de statut
        // Première alerte
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.frequency.setValueAtTime(1000, now);
        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc1.start(now);
        osc1.stop(now + 0.2);
        
        // Deuxième alerte (légèrement en retard et plus haute)
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.setValueAtTime(1400, now + 0.25);
        gain2.gain.setValueAtTime(0.4, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc2.start(now + 0.25);
        osc2.stop(now + 0.45);
      } catch (err) {
        console.log('Son de notification non disponible');
      }
    }

    // Socket.io event listeners
    socket.on('order_preparing_notification', (data) => {
      if (data.table_number === currentTableNumber) {
        playOrderStatusSound();
        showToast('🍳 Votre commande est en préparation!', 'success');
      }
    });

    socket.on('order_served_notification', (data) => {
      if (data.table_number === currentTableNumber) {
        playOrderStatusSound();
        showToast('✅ Votre commande est prête! À venir chercher!', 'success');
      }
    });

    // Initialize
    tableIdFromUrl = getTableIdFromURL();
    if (tableIdFromUrl) {
      setTimeout(() => showToast(`Bienvenue à la table ${tableIdFromUrl} ! 👋`, 'success'), 500);
    }
    loadMenuFromAPI();
    updateCartBar();
    initTableModal();
