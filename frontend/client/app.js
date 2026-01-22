
    // Data
    const menuItems = [
      {
        id: 1,
        name: 'Burger Classique',
        description: 'Pain brioché, steak haché 180g, cheddar, salade, tomate, oignons',
        price: 12.90,
        image: 'https://images.unsplash.com/photo-1627378378955-a3f4e406c5de?w=400',
        category: 'Burgers',
        popular: true,
      },
      {
        id: 2,
        name: 'Pizza Margherita',
        description: 'Tomate, mozzarella di bufala, basilic frais, huile d\'olive',
        price: 11.50,
        image: 'https://images.unsplash.com/photo-1563245738-9169ff58eccf?w=400',
        category: 'Pizzas',
        popular: true,
      },
      {
        id: 3,
        name: 'Pasta Carbonara',
        description: 'Pâtes fraîches, lardons, crème, parmesan, jaune d\'œuf',
        price: 13.90,
        image: 'https://images.unsplash.com/photo-1609166639722-47053ca112ea?w=400',
        category: 'Pâtes',
      },
      {
        id: 4,
        name: 'Salade César',
        description: 'Laitue romaine, poulet grillé, croûtons, parmesan, sauce césar',
        price: 10.90,
        image: 'https://images.unsplash.com/photo-1605034298551-baacf17591d1?w=400',
        category: 'Salades',
      },
      {
        id: 5,
        name: 'Tiramisu Maison',
        description: 'Biscuits imbibés de café, mascarpone, cacao',
        price: 6.50,
        image: 'https://images.unsplash.com/photo-1679942262057-d5732f732841?w=400',
        category: 'Desserts',
      },
      {
        id: 6,
        name: 'Sushi Deluxe',
        description: 'Assortiment de 12 pièces: saumon, thon, avocat, concombre',
        price: 16.90,
        image: 'https://images.unsplash.com/photo-1700324822763-956100f79b0d?w=400',
        category: 'Sushi',
        popular: true,
      },
    ];

    const categories = ['Tous', 'Burgers', 'Pizzas', 'Pâtes', 'Salades', 'Sushi', 'Desserts'];

    // State
    let cart = [];
    let selectedCategory = 'Tous';

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
      showToast('Commande confirmée ! Merci pour votre achat 🎉', 'success');
      cart = [];
      closeCartDrawer();
      renderMenu();
      updateCartBar();
    }

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
                <span class="card-price">${item.price.toFixed(2)} €</span>
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
                  <p class="cart-item-price">${cartItem.item.price.toFixed(2)} €</p>
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
                  <p class="cart-item-total">${(cartItem.item.price * cartItem.quantity).toFixed(2)} €</p>
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
            <span class="total-amount">${total.toFixed(2)} €</span>
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
        document.getElementById('cartTotalPrice').textContent = `${totalPrice.toFixed(2)} €`;
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

    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');
      
      toast.className = `toast ${type} visible`;
      toastMessage.textContent = message;
      
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 3000);
    }

    // Initialize
    renderMenu();
    renderCategories();
    updateCartBar();
