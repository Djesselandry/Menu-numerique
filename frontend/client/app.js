
    // Socket.io initialization
    const socket = io();
    
    // Data
    async function loadMenuFromAPI() {
  try {
    const res = await fetch("/api/menu");
    const data = await res.json();

    // Adapter les données backend → frontend
    menuItems = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || "Description non disponible",
      price: Number(item.price),
      image: item.image_url ? `/uploads${item.image_url}` : '/assets/images/placeholder.png',
      category: item.category || "Tous",
      popular: item.popular || false
    }));

    renderMenu();
    renderCategories();
  } catch (error) {
    console.error("Erreur chargement menu :", error);
    showToast("Impossible de charger le menu", "error");
  }
}

    let menuItems = [];

    const categories = ['Tous', 'Burgers', 'Pizzas', 'Pâtes', 'Salades', 'Sushi', 'Desserts'];

    // State
    let cart = [];
    let selectedCategory = 'Tous';
    let currentTableNumber = null;

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
      // Ouvrir le modal pour demander le numéro de table
      openTableModal();
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
      const tableNumber = parseInt(document.getElementById('tableNumberInput').value, 10);
      
      if (!tableNumber || tableNumber <= 0) {
        showToast('Veuillez entrer un numéro de table valide', 'error');
        return;
      }

      try {
        // Préparer les données de la commande
        const orderData = {
          tableNumber: tableNumber,
          items: cart.map(cartItem => ({
            id: cartItem.item.id,
            name: cartItem.item.name,
            price: cartItem.item.price,
            quantity: cartItem.quantity
          }))
        };

        // Envoyer la commande au serveur
        const response = await fetch('/api/orders', {
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
            <div class="card-image-container">
              <img src="${item.image}" alt="${item.name}" class="card-image">
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
      playNotificationSound(type);
      
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');
      
      toast.className = `toast ${type} visible`;
      toastMessage.textContent = message;
      
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 3000);
    }

    // Socket.io event listeners
    socket.on('order_preparing_notification', (data) => {
      if (data.table_number === currentTableNumber) {
        showToast('🍳 Votre commande est en préparation!', 'success');
      }
    });

    socket.on('order_served_notification', (data) => {
      if (data.table_number === currentTableNumber) {
        showToast('✅ Votre commande est prête! À venir chercher!', 'success');
      }
    });

    // Initialize
    loadMenuFromAPI();
    renderCategories();
    updateCartBar();
