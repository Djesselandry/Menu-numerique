        // ===== AUTHENTICATION SYSTEM =====
        const AUTH_TOKEN_KEY = 'adminToken';
        const API_URL = 'http://localhost:5000/api';

        // Socket.io initialization
        const socket = io();

        // Authentication Elements
        const loginScreen = document.getElementById('login-screen');
        const dashboard = document.getElementById('dashboard');
        const loginForm = document.getElementById('login-form');
        const loginUsernameInput = document.getElementById('login-username');
        const loginPasswordInput = document.getElementById('login-password');
        const loginSubmitBtn = document.getElementById('login-submit-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const loginError = document.getElementById('login-error');

        // Auth initialization
        function initializeAuth() {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (token) {
                showDashboard();
            } else {
                showLoginScreen();
            }
        }

        function showLoginScreen() {
            loginScreen.classList.add('active');
            dashboard.classList.remove('active');
        }

        function showDashboard() {
            loginScreen.classList.remove('active');
            dashboard.classList.add('active');
        }

        // Handle login form submission
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = loginUsernameInput.value.trim();
            const password = loginPasswordInput.value.trim();
            
            if (!username || !password) {
                showLoginError('Veuillez remplir tous les champs');
                return;
            }

            loginSubmitBtn.disabled = true;
            loginSubmitBtn.textContent = 'Connexion en cours...';
            loginError.classList.remove('show');

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
                    showLoginError(data.error || 'Erreur de connexion');
                    loginSubmitBtn.disabled = false;
                    loginSubmitBtn.textContent = 'Se connecter';
                    return;
                }

                // Save token to localStorage
                localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                
                // Clear form
                loginUsernameInput.value = '';
                loginPasswordInput.value = '';
                loginError.classList.remove('show');
                
                // Show dashboard
                showDashboard();
                
                // Reset button
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.textContent = 'Se connecter';
            } catch (err) {
                console.log('Erreur:', err);
                showLoginError('Erreur de connexion au serveur');
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.textContent = 'Se connecter';
            }
        });

        // Handle logout
        logoutBtn.addEventListener('click', async () => {
            try {
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                
                if (token) {
                    await fetch(`${API_URL}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                }
            } catch (err) {
                console.error('Erreur lors de la déconnexion:', err);
            } finally {
                // Clear token regardless of API response
                localStorage.removeItem(AUTH_TOKEN_KEY);
                
                // Reset form and show login screen
                loginUsernameInput.value = '';
                loginPasswordInput.value = '';
                loginError.classList.remove('show');
                
                showLoginScreen();
            }
        });

        function showLoginError(message) {
            loginError.textContent = message;
            loginError.classList.add('show');
        }

        // ===== DASHBOARD CODE =====
        // Data
        let orders = [];
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

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            initializeAuth();
            updateDate();
            setupTabs();
            loadMenuFromAPI();
            loadOrders();
            renderInvoices();
            setupSearch();
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

        // Fonction pour jouer un son d'alerte pour nouvelle commande (plus fort et distinctif)
        function playOrderNotificationSound() {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const now = audioContext.currentTime;
                
                // Double alerte pour nouvelle commande
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

        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            document.getElementById('toast-message').textContent = message;
            toast.classList.add('active');
            setTimeout(() => toast.classList.remove('active'), 3000);
        }

        // Orders Functions
        function renderOrders() {
            const activeOrders = orders.filter(o => o.status !== 'SERVED' && o.status !== 'ARCHIVED');
            const servedOrders = orders.filter(o => o.status === 'SERVED' || o.status === 'ARCHIVED');
            
            document.getElementById('active-orders-count').textContent = activeOrders.length;
            
            const ordersGrid = document.getElementById('orders-grid');
            ordersGrid.innerHTML = activeOrders.length === 0 
                ? '<div class="empty-state card"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><p>Aucune commande en attente</p></div>'
                : activeOrders.map(order => createOrderCard(order, false)).join('');
            
            const servedSection = document.getElementById('served-orders-section');
            if (servedOrders.length > 0) {
                servedSection.style.display = 'block';
                document.getElementById('served-orders-grid').innerHTML = 
                    servedOrders.map(order => createOrderCard(order, true)).join('');
            } else {
                servedSection.style.display = 'none';
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
                        <p style="color: #f97316; font-weight: bold; font-size: 1.125rem; margin: 0.5rem 0;">${item.price.toFixed(2)} fbu</p>
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
                                ${invoice.totalPrice.toFixed(2)} fbu
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
                                        ${(item.quantity * item.price).toFixed(2)} fbu
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
            if (!invoice) {
                showToast('Facture introuvable', 'error');
                return;
            }

            console.log('Invoice data:', invoice); // Debug

            const printWindow = window.open('', '', 'width=400,height=600');
            if (!printWindow) {
                showToast('Veuillez autoriser les fenêtres popup');
                return;
            }

            // Vérifier que les items existent
            const items = invoice.items && Array.isArray(invoice.items) ? invoice.items : [];
            
            // Format compatible avec imprimantes 80mm thermiques/tickets
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Facture ${invoice.invoiceNumber}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Courier New', monospace; 
                            width: 80mm; 
                            max-width: 100%;
                            padding: 0;
                            background: white;
                            color: #000;
                        }
                        .container { width: 100%; padding: 4mm; }
                        .center { text-align: center; }
                        .header { font-weight: bold; font-size: 18px; margin-bottom: 2mm; }
                        .divider { border-top: 1px dashed #000; margin: 2mm 0; }
                        .info-row { display: flex; justify-content: space-between; font-size: 11px; margin: 1mm 0; }
                        .info-label { font-weight: bold; }
                        .items-section { margin: 2mm 0; }
                        .item-row { display: grid; grid-template-columns: 2fr 1fr 1fr; font-size: 11px; gap: 2px; margin: 1mm 0; }
                        .item-name { word-break: break-word; }
                        .item-qty { text-align: center; }
                        .item-price { text-align: right; }
                        .item-detail { font-size: 10px; color: #333; }
                        .total-section { margin: 2mm 0; }
                        .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; }
                        .footer { text-align: center; font-size: 10px; margin-top: 3mm; color: #333; }
                        .footer-text { margin: 1mm 0; }
                        @media print { 
                            body { width: 80mm; padding: 0; }
                            .container { padding: 4mm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="center header">🍽️ RESTAURANT</div>
                        <div class="center" style="font-size: 10px;">Délicieux & Frais</div>
                        <div class="divider"></div>
                        
                        <div class="info-row">
                            <span class="info-label">Facture:</span>
                            <span>${invoice.invoiceNumber || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Table:</span>
                            <span>${invoice.tableNumber || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date:</span>
                            <span>${invoice.date || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Heure:</span>
                            <span>${invoice.time || 'N/A'}</span>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <div style="font-size: 11px; font-weight: bold; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2px; margin-bottom: 1mm;">
                            <span>ARTICLE</span>
                            <span style="text-align: center;">QTE</span>
                            <span style="text-align: right;">TOTAL</span>
                        </div>
                        <div class="divider"></div>
                        
                        <div class="items-section">
                            ${items.length > 0 ? items.map(item => {
                                const itemName = item.name || item.item_name || 'Article';
                                const itemQty = item.quantity || item.qty || 1;
                                const itemPrice = parseFloat(item.price || item.unit_price || 0);
                                const itemTotal = itemQty * itemPrice;
                                
                                return `
                                    <div class="item-row">
                                        <span class="item-name">${itemName}</span>
                                        <span class="item-qty">${itemQty}</span>
                                        <span class="item-price">${itemTotal.toFixed(2)} fbu</span>
                                    </div>
                                    <div style="font-size: 9px; color: #666; grid-column: 1/4; text-align: right;">${itemPrice.toFixed(2)} fbu x ${itemQty}</div>
                                `;
                            }).join('') : '<div style="text-align: center; color: #999; padding: 2mm;">Aucun article</div>'}
                        </div>
                        
                        <div class="divider"></div>
                        
                        <div class="total-section">
                            <div class="total-row">
                                <span>TOTAL TTC:</span>
                                <span>${(invoice.totalPrice || 0).toFixed(2)} fbu</span>
                            </div>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <div class="center footer">
                            <div class="footer-text">Merci de votre visite !</div>
                            <div class="footer-text">Restaurant - Rue Principale</div>
                            <div class="footer-text" style="margin-top: 2mm; font-weight: bold;">${new Date().toLocaleString('fr-FR')}</div>
                        </div>
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

        // ===== ORDERS FUNCTIONS =====
        async function loadOrders() {
            try {
                const response = await fetch(`${API_URL}/orders`);
                if (!response.ok) throw new Error('Erreur chargement commandes');
                
                const data = await response.json();
                orders = data.map(order => ({
                    id: order.id,
                    tableNumber: order.table_number,
                    status: order.status,
                    totalPrice: Number(order.total),
                    itemCount: order.item_count || 0,
                    time: new Date(order.created_at).toLocaleTimeString('fr-FR'),
                    items: [] // Will be filled when fetching details
                }));
                
                // Charger les détails de chaque commande
                for (let order of orders) {
                    const details = await loadOrderDetails(order.id);
                    if (details && details.items) {
                        order.items = details.items.filter(item => item !== null);
                    }
                }
                
                renderOrders();
            } catch (err) {
                console.error('Erreur chargement commandes:', err);
            }
        }

        async function loadOrderDetails(orderId) {
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}`);
                if (!response.ok) throw new Error('Erreur chargement détails');
                
                const data = await response.json();
                return data;
            } catch (err) {
                console.error('Erreur:', err);
                return null;
            }
        }

        function createOrderCard(order, isServed = false) {
            const statusColors = {
                'PENDING': { bg: '#fef3c7', text: '#92400e', label: 'En attente' },
                'PREPARING': { bg: '#dbeafe', text: '#1e40af', label: 'En préparation' },
                'SERVED': { bg: '#dcfce7', text: '#15803d', label: 'Servie' },
                'ARCHIVED': { bg: '#f3f4f6', text: '#4b5563', label: 'Archivée' }
            };
            
            const statusInfo = statusColors[order.status] || statusColors['PENDING'];
            
            const actionButtons = !isServed
                ? (order.status === 'PENDING'
                    ? `<button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="updateOrderStatus(${order.id}, 'PREPARING')">Commencer la préparation</button>`
                    : order.status === 'PREPARING'
                    ? `<button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="updateOrderStatus(${order.id}, 'SERVED')">Marquer comme servie</button>`
                    : '')
                : '';
            
            const itemsHTML = order.items && order.items.length > 0
                ? order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f9fafb; border-radius: 0.375rem; margin-bottom: 0.5rem;">
                        <div style="flex: 1;">
                            <p style="font-weight: 500; color: #111827; margin: 0;">${item.quantity}x ${item.name}</p>
                        </div>
                        <p style="font-weight: 600; color: #f97316; margin: 0;">${(item.subtotal || 0).toFixed(2)} fbu</p>
                    </div>
                `).join('')
                : '<p style="color: #9ca3af; font-size: 0.875rem; margin: 0;">Aucun article</p>';
            
            return `
                <div class="card" style="${isServed ? 'opacity: 0.8; background: #f9fafb;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.25rem;">
                        <div>
                            <h3 style="font-size: 1.375rem; font-weight: 700; color: #111827; margin: 0;">Table ${order.tableNumber}</h3>
                            <p style="font-size: 0.8rem; color: #6b7280; margin: 0.25rem 0 0 0;">🕐 ${order.time}</p>
                        </div>
                        <div style="background: ${statusInfo.bg}; color: ${statusInfo.text}; padding: 0.5rem 0.875rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.8125rem; white-space: nowrap;">
                            ${statusInfo.label}
                        </div>
                    </div>
                    
                    <div style="background: #fff9f5; border: 1px solid #fed7aa; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                        <p style="font-size: 0.8125rem; font-weight: 600; color: #92400e; margin: 0 0 0.75rem 0; text-transform: uppercase;">📦 Articles (${order.itemCount})</p>
                        ${itemsHTML}
                    </div>
                    
                    <div style="border-top: 2px solid #e5e7eb; padding-top: 1rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #374151; font-size: 0.95rem;">TOTAL</span>
                            <span style="font-size: 1.5rem; font-weight: 700; color: ${isServed ? '#6b7280' : '#f97316'};">
                                ${order.totalPrice.toFixed(2)} fbu
                            </span>
                        </div>
                    </div>
                    
                    ${actionButtons}
                </div>
            `;
        }

        async function updateOrderStatus(orderId, newStatus) {
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) throw new Error('Erreur mise à jour');

                const statusTexts = {
                    'PREPARING': 'en préparation',
                    'SERVED': 'servie'
                };
                
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    order.status = newStatus;
                    
                    // Emit Socket.IO events
                    if (newStatus === 'PREPARING') {
                        socket.emit('order_preparing', {
                            order_id: orderId,
                            table_number: order.tableNumber,
                            status: newStatus
                        });
                    } else if (newStatus === 'SERVED') {
                         // Generate invoice automatically
                        generateInvoice(order);
                        socket.emit('order_served', {
                            order_id: orderId,
                            table_number: order.tableNumber,
                            status: newStatus
                        });
                        
                    }
                }
                
                showToast(`✓ Table ${orders.find(o => o.id === orderId)?.tableNumber} ${statusTexts[newStatus]}`, 'success');
                loadOrders(); // Rafraîchir les commandes
            } catch (err) {
                console.error('Erreur:', err);
                showToast('Erreur lors de la mise à jour', 'error');
            }
        }

        function generateInvoice(order) {
            const now = new Date();
            const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(invoiceCounter).padStart(4, '0')}`;
            
            const invoice = {
                id: invoiceCounter,
                invoiceNumber,
                tableNumber: order.tableNumber,
                items: order.items || [],
                totalPrice: order.totalPrice,
                date: now.toLocaleDateString('fr-FR'),
                time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };
            
            invoices.unshift(invoice);
            invoiceCounter++;
            
            showToast(`📄 Facture ${invoice.invoiceNumber} générée automatiquement`);
            renderInvoices();
        }

        // Socket.io event listeners
        socket.on('new_order_notification', (data) => {
            // Jouer le son d'alerte pour la nouvelle commande
            playOrderNotificationSound();
            
            // Afficher le message sans son (le son est déjà joué ci-dessus)
            showToast(`🔔 NOUVELLE COMMANDE! Table ${data.table_number} - ${data.items.length} article(s) - ${data.total?.toFixed(2) || 0} fbu`, 'success');
            loadOrders(); // Charger les nouvelles commandes immédiatement
        });

        // Auto-refresh orders every 3 seconds
        setInterval(loadOrders, 3000);