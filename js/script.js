(function(){
    "use strict";

    // ---------- DATI PRODOTTI (MOCK) ----------
    const products = [
        {
            id: 1,
            name: "Giacca utility in cotone",
            category: "Abbigliamento",
            price: 129.99,
            originalPrice: 189.99,
            image: "https://placehold.co/400x500/eaeef2/2a2e35?text=Giacca",
            imgAlt: "Giacca utility"
        },
        {
            id: 2,
            name: "Felpa minimal oversize",
            category: "Felpe",
            price: 64.50,
            originalPrice: null,
            image: "https://placehold.co/400x500/d8dde3/2a2e35?text=Felpa",
            imgAlt: "Felpa oversize"
        },
        {
            id: 3,
            name: "Pantaloni cargo relaxed",
            category: "Pantaloni",
            price: 89.90,
            originalPrice: 110.00,
            image: "https://placehold.co/400x500/e2e6ea/2a2e35?text=Cargo",
            imgAlt: "Pantaloni cargo"
        },
        {
            id: 4,
            name: "T-shirt organic cotton",
            category: "T-shirt",
            price: 34.99,
            originalPrice: null,
            image: "https://placehold.co/400x500/eef0f2/2a2e35?text=T-Shirt",
            imgAlt: "T-shirt"
        },
        {
            id: 5,
            name: "Sneakers unisex canvas",
            category: "Scarpe",
            price: 79.95,
            originalPrice: 99.95,
            image: "https://placehold.co/400x500/d3d9e0/2a2e35?text=Sneakers",
            imgAlt: "Sneakers"
        },
        {
            id: 6,
            name: "Borsa a tracolla",
            category: "Accessori",
            price: 49.90,
            originalPrice: null,
            image: "https://placehold.co/400x500/e2e1dd/2a2e35?text=Borsa",
            imgAlt: "Borsa"
        }
    ];

    // ---------- STATO CARRELLO ----------
    let cart = [];  // { id, name, price, image, quantity }

    // Elementi DOM
    const productsContainer = document.getElementById('productsContainer');
    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsDiv = document.getElementById('cartItemsContainer');
    const cartTotalSpan = document.getElementById('cartTotalPrice');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Menu sinistro
    const menuDrawer = document.getElementById('menuDrawer');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const globalOverlay = document.getElementById('globalOverlay');

    // ---------- FUNZIONI RENDER ----------
    function renderProducts() {
        if (!productsContainer) return;
        let html = '';
        products.forEach(prod => {
            const formattedPrice = `€${prod.price.toFixed(2)}`;
            const originalPriceHtml = prod.originalPrice ? `<s>€${prod.originalPrice.toFixed(2)}</s>` : '';
            
            html += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${prod.image}" alt="${prod.imgAlt || prod.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <div class="product-category">${prod.category}</div>
                        <div class="product-title">${prod.name}</div>
                        <div class="price">${formattedPrice} ${originalPriceHtml}</div>
                        <button class="btn-add" data-id="${prod.id}">
                            <i class="fas fa-plus"></i> Aggiungi al carrello
                        </button>
                    </div>
                </div>
            `;
        });
        productsContainer.innerHTML = html;

        // Attacca event listener ai bottoni "Aggiungi"
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                addToCart(id);
            });
        });
    }

    // Aggiungi prodotto al carrello
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                imgAlt: product.imgAlt || product.name,
                quantity: 1
            });
        }
        updateCartUI();
        openCart(); // Apriamo automaticamente il carrello dopo l'aggiunta
    }

    // Rimuovi completamente
    function removeCartItem(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCartUI();
    }

    // Aggiorna quantità (+1 / -1)
    function updateQuantity(itemId, delta) {
        const item = cart.find(i => i.id === itemId);
        if (!item) return;
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            removeCartItem(itemId);
        } else {
            item.quantity = newQty;
        }
        updateCartUI();
    }

    // Calcola totale
    function calcTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Aggiorna contatore, totale e render del drawer
    function updateCartUI() {
        // Aggiorna contatore icona
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountSpan.textContent = totalItems;

        // Render lista carrello
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<div class="cart-empty-msg">Il carrello è vuoto</div>';
        } else {
            let itemsHtml = '';
            cart.forEach(item => {
                const itemTotal = (item.price * item.quantity).toFixed(2);
                itemsHtml += `
                    <div class="cart-item">
                        <div class="cart-item-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                        </div>
                        <div class="cart-item-actions">
                            <div class="qty-control">
                                <button class="qty-btn" data-action="decr" data-id="${item.id}">−</button>
                                <span class="qty-value">${item.quantity}</span>
                                <button class="qty-btn" data-action="incr" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}" title="Rimuovi"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                `;
            });
            cartItemsDiv.innerHTML = itemsHtml;

            // Event listeners per bottoni quantità e rimuovi
            cartItemsDiv.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    const action = btn.dataset.action;
                    updateQuantity(id, action === 'incr' ? 1 : -1);
                });
            });
            cartItemsDiv.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id);
                    removeCartItem(id);
                });
            });
        }

        // Aggiorna totale
        const total = calcTotal();
        cartTotalSpan.textContent = `€${total.toFixed(2)}`;
    }

    // ---------- CONTROLLI CARRELLO (APRI/CHIUDI) ----------
    function openCart() {
        closeMenu(); // Chiude il menu se aperto
        cartDrawer.classList.add('active');
        globalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartDrawer.classList.remove('active');
        if (!menuDrawer.classList.contains('active')) {
            globalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ---------- CONTROLLI MENU SINISTRO ----------
    function openMenu() {
        closeCart(); // Chiude il carrello se aperto
        menuDrawer.classList.add('active');
        globalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menuDrawer.classList.remove('active');
        if (!cartDrawer.classList.contains('active')) {
            globalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Chiudi tutto (overlay click)
    function closeAllDrawers() {
        closeCart();
        closeMenu();
    }

    // ---------- EVENT LISTENER GLOBALI ----------
    function initEvents() {
        // Carrello
        cartToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (cartDrawer.classList.contains('active')) {
                closeCart();
            } else {
                openCart();
            }
        });
        closeCartBtn.addEventListener('click', closeCart);

        // Menu
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menuDrawer.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        closeMenuBtn.addEventListener('click', closeMenu);

        // Overlay
        globalOverlay.addEventListener('click', closeAllDrawers);

        // Checkout simulato
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('🛒 Il carrello è vuoto. Aggiungi almeno un prodotto.');
                return;
            }
            alert(`✅ Grazie per l'ordine!\nTotale: ${cartTotalSpan.textContent}\n(Simulazione template)`);
            cart = [];
            updateCartUI();
            closeCart();
        });

        // Chiudi con tasto ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllDrawers();
            }
        });

        // Previeni chiusura quando si clicca dentro i drawer
        menuDrawer.addEventListener('click', (e) => e.stopPropagation());
        cartDrawer.addEventListener('click', (e) => e.stopPropagation());
    }

    // ---------- INIZIALIZZA ----------
    function init() {
        renderProducts();
        updateCartUI(); // carica carrello vuoto
        initEvents();
    }

    init();
})();