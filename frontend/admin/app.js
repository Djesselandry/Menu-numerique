
        // Data
        let orders = [];
        let isFirstLoad = true;

        let menuItems = [];
        let invoices = [];
        let invoiceCounter = 1;
        let editingItemId = null;
        let selectedCategory = 'Tous';

        // Charger le menu depuis l'API
        async function loadMenuFromAPI() {
            try {
                const res = await fetch("/api/menu");
                const data = await res.json();
                
                menuItems = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description || "",
                    price: Number(item.price),
                    image: item.image_url ? `/uploads${item.image_url}` : 'https://via.placeholder.com/400x300?text=Menu',
                    category: item.category || "Autres",
                    available: item.is_active || true
                }));

                renderMenu();
                setupMenuEventListeners();
            } catch (error) {
                console.error("Erreur chargement menu :", error);
                showToast("Impossible de charger le menu", "error");
            }
        }

        // Charger les commandes depuis l'API
        async function loadOrdersFromAPI() {
            try {
                const res = await fetch("/api/orders");
                const data = await res.json();
                
                // Détecter les nouvelles commandes pour la notification sonore
                if (!isFirstLoad) {
                    const currentIds = new Set(orders.map(o => o.id));
                    const newOrders = data.filter(o => !currentIds.has(o.id));
                    
                    if (newOrders.length > 0) {
                        playNotificationSound();
                        showToast(`🔔 ${newOrders.length} nouvelle(s) commande(s) !`);
                    }
                }

                // Adapter les données backend -> frontend
                orders = data.map(order => ({
                    id: order.id,
                    tableNumber: order.table_number,
                    items: order.items || [],
                    totalPrice: Number(order.total),
                    status: order.status.toLowerCase(),
                    time: new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                }));

                isFirstLoad = false;
                renderOrders();
            } catch (error) {
                console.error("Erreur chargement commandes :", error);
                showToast("Impossible de charger les commandes");
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            updateDate();
            setupTabs();
            loadMenuFromAPI();
            loadOrdersFromAPI();
            renderInvoices();
            setupSearch();
            
            // Rafraîchir les commandes toutes les 10 secondes
            setInterval(loadOrdersFromAPI, 10000);
        });

        function updateDate() {
            const date = new Date();
            const options = { weekday: 'long', day: 'numeric', month: 'long' };
            document.getElementById('current-date').textContent = 
                date.toLocaleDateString('fr-FR', options);
        }

        function setupTabs() {
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    tab.classList.add('active');
                    document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
                });
            });
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-message').textContent = message;
            toast.classList.add('active');
            setTimeout(() => toast.classList.remove('active'), 3000);
        }

        function playNotificationSound() {
            // Créer un contexte audio pour un son "Ding" agréable
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // Do (C5)
            osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // Monte d'une octave
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        }

        // Orders Functions
        function renderOrders() {
            const activeOrders = orders.filter(o => o.status !== 'served');
            const servedOrders = orders.filter(o => o.status === 'served');
            
            document.getElementById('active-orders-count').textContent = activeOrders.length;
            
            const ordersGrid = document.getElementById('orders-grid');
            ordersGrid.innerHTML = activeOrders.length === 0 
                ? '<div class="empty-state card"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><p>Aucune commande active</p></div>'
                : activeOrders.map(order => createOrderCard(order)).join('');
            
            const servedSection = document.getElementById('served-orders-section');
            if (servedOrders.length > 0) {
                servedSection.style.display = 'block';
                document.getElementById('served-orders-grid').innerHTML = 
                    servedOrders.map(order => createOrderCard(order, true)).join('');
            } else {
                servedSection.style.display = 'none';
            }
        }

        function createOrderCard(order, isServed = false) {
            const statusClass = {
                pending: 'badge-yellow',
                preparing: 'badge-blue',
                served: 'badge-green'
            }[order.status];
            
            const statusText = {
                pending: 'En attente',
                preparing: 'En préparation',
                served: 'Servi'
            }[order.status];

            const actionButtons = order.status === 'pending' 
                ? `<button class="btn btn-secondary" style="width: 100%;" onclick="updateOrderStatus(${order.id}, 'preparing')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M7 6V4a1 1 0 011-1h8a1 1 0 011 1v2M5 6h14l-1 14H6L5 6z"></path></svg>
                    En préparation
                   </button>`
                : order.status === 'preparing'
                ? `<button class="btn btn-success" style="width: 100%;" onclick="updateOrderStatus(${order.id}, 'served')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Servi
                   </button>`
                : '';

            return `
                <div class="card" style="${isServed ? 'background: #f9fafb; opacity: 0.75;' : 'border: 2px solid #f3f4f6;'}">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h3 style="font-size: 1.125rem; font-weight: bold; color: ${isServed ? '#6b7280' : '#111827'};">Table ${order.tableNumber}</h3>
                            <p style="font-size: 0.875rem; color: #6b7280;">${order.time}</p>
                        </div>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span style="font-weight: 500;">${item.quantity}x ${item.name}</span>
                                <span style="color: #6b7280;">${(item.quantity * item.price).toFixed(2)} €</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 0.75rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #374151;">Total</span>
                            <span style="font-size: 1.25rem; font-weight: bold; color: ${isServed ? '#6b7280' : '#f97316'};">
                                ${order.totalPrice.toFixed(2)} €
                            </span>
                        </div>
                    </div>
                    ${actionButtons}
                </div>
            `;
        }

 async function updateOrderStatus(orderId, status) {
            try {
                // Appel API pour mettre à jour le statut
                const res = await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });

                if (!res.ok) throw new Error('Erreur serveur');

                // Mise à jour locale et gestion de la facture
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    order.status = status;

                    if (status === 'served') {
                        const now = new Date();
                        const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(invoiceCounter).padStart(4, '0')}`;
                        
                        invoices.unshift({
                            id: invoiceCounter,
                            invoiceNumber,
                            tableNumber: order.tableNumber,
                            items: order.items,
                            totalPrice: order.totalPrice,
                            date: now.toLocaleDateString('fr-FR'),
                            time: order.time
                        });
                        
                        invoiceCounter++;
                        showToast(`Facture  générée automatiquement`);
                        renderInvoices();
                    }
                }

                const statusText = status === 'preparing' ? 'en préparation' : 'servie';
                showToast(`Commande # passée `);
                
                // Recharger les commandes pour synchroniser
                loadOrdersFromAPI();
            } catch (error) {
                console.error(error);
                showToast("Impossible de mettre à jour le statut", "error");
            }
        }
        async function updateOrderStatus(orderId, status) {
            try {
                // Appel API pour mettre à jour le statut
                const res = await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });

                if (!res.ok) throw new Error('Erreur serveur');

                // Mise à jour locale et gestion de la facture
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    order.status = status;

                    if (status === 'served') {
                        const now = new Date();
                        const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(invoiceCounter).padStart(4, '0')}`;
                        
                        invoices.unshift({
                            id: invoiceCounter,
                            invoiceNumber,
                            tableNumber: order.tableNumber,
                            items: order.items,
                            totalPrice: order.totalPrice,
                            date: now.toLocaleDateString('fr-FR'),
                            time: order.time
                        });
                        
                        invoiceCounter++;
                        showToast(`Facture ${invoiceNumber} générée automatiquement`);
                        renderInvoices();
                    }
                }

                const statusText = status === 'preparing' ? 'en préparation' : 'servie';
                showToast(`Commande #${orderId} passée ${statusText}`);
                
                // Recharger les commandes pour synchroniser
                loadOrdersFromAPI();
            } catch (error) {
                console.error(error);
                showToast("Impossible de mettre à jour le statut", "error");
            }
        }

        // Menu Functions
        function renderMenu() {
            const categories = ['Tous', ...new Set(menuItems.map(item => item.category))];
            document.getElementById('category-filters').innerHTML = categories.map(cat => `
                <button class="btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}" 
                        onclick="selectCategory('${cat}')">${cat}</button>
            `).join('');

            const searchQuery = document.getElementById('menu-search')?.value.toLowerCase() || '';
            const filtered = menuItems.filter(item => {
                const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
                const matchesSearch = !searchQuery || 
                    item.name.toLowerCase().includes(searchQuery) ||
                    item.description.toLowerCase().includes(searchQuery);
                return matchesCategory && matchesSearch;
            });

            document.getElementById('menu-items-count').textContent = menuItems.length;
            
            const menuGrid = document.getElementById('menu-grid');
            menuGrid.innerHTML = filtered.length === 0
                ? '<div class="empty-state card"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg><p>Aucun article dans cette catégorie</p></div>'
                : filtered.map(item => createMenuItemCard(item)).join('');
        }

        function createMenuItemCard(item) {
            return `
                <div class="card menu-item-card ${!item.available ? 'menu-item-unavailable' : ''}">
                    <div style="position: relative;">
                        <img src="${item.image}" alt="${item.name}" class="menu-item-image" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4='">
                        ${!item.available ? '<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;"><span class="badge" style="background: #ef4444; color: white;">Indisponible</span></div>' : ''}
                    </div>
                    <div class="menu-item-content">
                        <h3 style="font-weight: bold; font-size: 1.125rem; margin-bottom: 0.25rem;">${item.name}</h3>
                        <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.description}</p>
                        <p style="color: #f97316; font-weight: bold; font-size: 1.125rem; margin: 0.5rem 0;">${item.price.toFixed(2)} €</p>
                        <span class="badge" style="border: 1px solid #e5e7eb; background: white; color: #6b7280; font-size: 0.75rem;">${item.category}</span>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; margin: 0.75rem 0; padding: 0.5rem; background: #f9fafb; border-radius: 0.5rem;">
                            <label style="font-size: 0.875rem; margin: 0;">Disponible</label>
                            <label class="switch">
                                <input type="checkbox" ${item.available ? 'checked' : ''} 
                                       onchange="toggleAvailability(${item.id})">
                                <span class="slider"></span>
                            </label>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-outline" style="flex: 1; font-size: 0.875rem;" onclick="editMenuItem(${item.id})">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Modifier
                            </button>
                            <button class="btn btn-outline" style="color: #ef4444; font-size: 0.875rem;" onclick="deleteMenuItem(${item.id}, '${item.name}')">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function selectCategory(category) {
            selectedCategory = category;
            renderMenu();
        }

        function toggleAvailability(id) {
            const item = menuItems.find(i => i.id === id);
            if (item) {
                item.available = !item.available;
                showToast(`${item.name} ${item.available ? 'activé' : 'désactivé'}`);
                renderMenu();
            }
        }

        function openMenuModal(item = null) {
            editingItemId = item ? item.id : null;
            document.getElementById('modal-title').textContent = item ? "Modifier l'article" : "Ajouter un article";
            
            if (item) {
                document.getElementById('item-name').value = item.name;
                document.getElementById('item-description').value = item.description;
                document.getElementById('item-price').value = item.price;
                document.getElementById('item-category').value = item.category;
                document.getElementById('item-image').value = '';
                document.getElementById('item-available').checked = item.available;
            } else {
                document.getElementById('menu-form').reset();
            }
            
            document.getElementById('menu-modal').classList.add('active');
        }

        function setupMenuEventListeners() {
            // Configuration des event listeners pour le menu
            document.getElementById('menu-search').addEventListener('input', renderMenu);
            document.getElementById('category-filters').addEventListener('change', (e) => {
                if (e.target.tagName === 'INPUT') {
                    selectedCategory = e.target.value;
                    renderMenu();
                }
            });
        }

        function closeMenuModal() {
            document.getElementById('menu-modal').classList.remove('active');
            editingItemId = null;
        }

        function editMenuItem(id) {
            const item = menuItems.find(i => i.id === id);
            if (item) openMenuModal(item);
        }

        function deleteMenuItem(id, name) {
            if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
                fetch(`/api/menu/${id}`, { method: 'DELETE' })
                    .then(() => {
                        menuItems = menuItems.filter(item => item.id !== id);
                        showToast('Article supprimé');
                        renderMenu();
                    })
                    .catch(err => {
                        console.error(err);
                        showToast('Erreur lors de la suppression', 'error');
                    });
            }
        }

        document.getElementById('menu-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('item-name').value;
            const description = document.getElementById('item-description').value;
            const price = parseFloat(document.getElementById('item-price').value);
            const category = document.getElementById('item-category').value;
            const available = document.getElementById('item-available').checked;
            const imageInput = document.getElementById('item-image');
            const hasNewImage = imageInput.files && imageInput.files[0];

            try {
                if (editingItemId) {
                    // Modifier un article
                    let res;
                    
                    if (hasNewImage) {
                        // Avec nouvelle image - envoyer FormData
                        const formData = new FormData();
                        formData.append('name', name);
                        formData.append('description', description);
                        formData.append('price', price);
                        formData.append('category', category);
                        formData.append('available', available);
                        formData.append('image', imageInput.files[0]);
                        
                        res = await fetch(`/api/menu/${editingItemId}`, {
                            method: 'PUT',
                            body: formData
                        });
                    } else {
                        // Sans image - envoyer JSON
                        res = await fetch(`/api/menu/${editingItemId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name,
                                description,
                                price,
                                category,
                                available
                            })
                        });
                    }
                    
                    if (!res.ok) {
                        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                    }
                    
                    const updatedItem = await res.json();
                    const index = menuItems.findIndex(i => i.id === editingItemId);
                    menuItems[index] = {
                        id: updatedItem.id,
                        name: updatedItem.name,
                        description: updatedItem.description || "",
                        price: Number(updatedItem.price),
                        image: updatedItem.image_url ? `/uploads${updatedItem.image_url}` : menuItems[index].image,
                        category: updatedItem.category || "Autres",
                        available: updatedItem.is_active || true
                    };
                    showToast('Article modifié avec succès');
                } else {
                    // Ajouter un nouvel article - envoyer FormData pour l'image
                    const formData = new FormData();
                    formData.append('name', name);
                    formData.append('description', description);
                    formData.append('price', price);
                    formData.append('category', category);
                    formData.append('available', available);
                    
                    if (hasNewImage) {
                        formData.append('image', imageInput.files[0]);
                    }
                    
                    const res = await fetch('/api/menu', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!res.ok) {
                        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                    }
                    
                    const newItem = await res.json();
                    menuItems.push({
                        id: newItem.id,
                        name: newItem.name,
                        description: newItem.description || "",
                        price: Number(newItem.price),
                        image: newItem.image_url ? `/uploads${newItem.image_url}` : 'https://via.placeholder.com/400x300?text=Menu',
                        category: newItem.category || "Autres",
                        available: newItem.is_active || true
                    });
                    showToast('Article ajouté avec succès');
                }
                closeMenuModal();
                renderMenu();
            } catch (error) {
                console.error('Erreur détaillée:', error);
                showToast('Erreur lors de l\'enregistrement: ' + error.message, 'error');
            }
        });

        // Invoices Functions
        function renderInvoices() {
            const searchQuery = document.getElementById('invoice-search')?.value.toLowerCase() || '';
            const filtered = invoices.filter(inv => 
                !searchQuery || 
                inv.invoiceNumber.toLowerCase().includes(searchQuery) ||
                inv.tableNumber.toString().includes(searchQuery)
            );

            document.getElementById('invoices-count').textContent = invoices.length;
            
            const invoicesGrid = document.getElementById('invoices-grid');
            invoicesGrid.innerHTML = filtered.length === 0
                ? '<div class="empty-state card"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><p>Aucune facture trouvée</p></div>'
                : filtered.map(invoice => createInvoiceCard(invoice)).join('');
        }

        function createInvoiceCard(invoice) {
            return `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <h3 style="font-size: 1.25rem; font-weight: bold;">Facture ${invoice.invoiceNumber}</h3>
                                <span class="badge" style="background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa;">
                                    Table ${invoice.tableNumber}
                                </span>
                            </div>
                            <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: #6b7280;">
                                <span>📅 ${invoice.date}</span>
                                <span>${invoice.time}</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Total</p>
                            <p style="font-size: 1.875rem; font-weight: bold; color: #f97316;">
                                ${invoice.totalPrice.toFixed(2)} €
                            </p>
                        </div>
                    </div>

                    <div style="background: #f9fafb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                        <h4 style="font-weight: 600; color: #374151; margin-bottom: 0.75rem; font-size: 0.875rem;">Articles commandés</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${invoice.items.map((item, index) => `
                                <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                                    <span style="color: #374151;">
                                        <span style="font-weight: 500;">${item.quantity}x</span> ${item.name}
                                    </span>
                                    <span style="color: #6b7280; font-weight: 500;">
                                        ${(item.quantity * item.price).toFixed(2)} €
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary" style="flex: 1;" onclick="printInvoice(${invoice.id})">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                            </svg>
                            Imprimer
                        </button>
                        <button class="btn btn-outline" style="flex: 1;" onclick="printInvoice(${invoice.id})">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Télécharger PDF
                        </button>
                    </div>
                </div>
            `;
        }

        function printInvoice(id) {
            const invoice = invoices.find(inv => inv.id === id);
            if (!invoice) return;

            const printWindow = window.open('', '', 'width=800,height=600');
            if (!printWindow) {
                showToast('Veuillez autoriser les fenêtres popup');
                return;
            }

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Facture ${invoice.invoiceNumber}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; padding: 40px; background: white; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #f97316; padding-bottom: 20px; }
                        .header h1 { color: #f97316; font-size: 32px; margin-bottom: 10px; }
                        .header p { color: #666; }
                        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 20px; background: #fff7ed; border-radius: 8px; }
                        .info-block h3 { color: #f97316; margin-bottom: 5px; font-size: 14px; }
                        .info-block p { color: #333; font-size: 16px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th { background: #f97316; color: white; padding: 12px; text-align: left; font-weight: 600; }
                        td { padding: 12px; border-bottom: 1px solid #e5e5e5; }
                        tr:hover { background: #f9f9f9; }
                        .total-row { background: #fff7ed; font-weight: bold; font-size: 18px; }
                        .total-row td { border-bottom: none; padding: 20px 12px; }
                        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e5e5e5; padding-top: 20px; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🍽️ Restaurant</h1>
                        <p>Délicieux & Frais</p>
                    </div>
                    <div class="info-section">
                        <div class="info-block">
                            <h3>FACTURE N°</h3>
                            <p><strong>${invoice.invoiceNumber}</strong></p>
                        </div>
                        <div class="info-block">
                            <h3>TABLE</h3>
                            <p><strong>Table ${invoice.tableNumber}</strong></p>
                        </div>
                        <div class="info-block">
                            <h3>DATE</h3>
                            <p>${invoice.date}</p>
                        </div>
                        <div class="info-block">
                            <h3>HEURE</h3>
                            <p>${invoice.time}</p>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th style="text-align: center;">Quantité</th>
                                <th style="text-align: right;">Prix Unit.</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td style="text-align: right;">${item.price.toFixed(2)} €</td>
                                    <td style="text-align: right;">${(item.quantity * item.price).toFixed(2)} €</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right; color: #f97316;">TOTAL</td>
                                <td style="text-align: right; color: #f97316;">${invoice.totalPrice.toFixed(2)} €</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="footer">
                        <p>Merci de votre visite !</p>
                        <p>Restaurant - 123 Rue de la Gastronomie, 75001 Paris</p>
                        <p>Tél: 01 23 45 67 89</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => {
                printWindow.print();
                showToast('Facture envoyée à l\'impression');
            }, 250);
        }

        function setupSearch() {
            document.getElementById('menu-search')?.addEventListener('input', renderMenu);
            document.getElementById('invoice-search')?.addEventListener('input', renderInvoices);
        }

        document.getElementById('menu-modal').addEventListener('click', (e) => {
            if (e.target.id === 'menu-modal') closeMenuModal();
        });