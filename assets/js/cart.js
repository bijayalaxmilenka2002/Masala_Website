/**
 * SUBHADARSHINI SPICES - SHOPPING BASKET & CART CONTROLLER
 * Full-featured e-commerce cart with persistent per-user storage, slide-out drawer,
 * variant support, and instant WhatsApp ordering for all products in the basket.
 * (Orders are exclusively processed via WhatsApp).
 */

(function (window, document) {
  'use strict';

  const CartManager = {
    items: [],

    init() {
      this.loadCart();
      this.ensureDrawerDOM();
      this.bindEvents();
      this.updateBadges();
      this.renderDrawer();

      // Listen for user sign-in / sign-out to switch to individual client cart
      window.addEventListener('auth:user-changed', () => {
        this.loadCart();
        this.updateBadges();
        this.renderDrawer();
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: this.items } }));
      });
    },

    // --- Dynamic Per-Client Storage Key ---
    getStorageKey() {
      const user = window.CustomerAuth ? window.CustomerAuth.getCurrentUser() : null;
      if (user && user.phone) {
        return `subhadarshini_cart_${user.phone}`;
      }
      return 'subhadarshini_cart_guest';
    },

    // --- Local Storage Management ---
    loadCart() {
      try {
        const key = this.getStorageKey();
        const stored = localStorage.getItem(key);
        this.items = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(this.items)) this.items = [];
      } catch (err) {
        console.warn('Failed to load cart from localStorage:', err);
        this.items = [];
      }
    },

    saveCart() {
      try {
        const key = this.getStorageKey();
        localStorage.setItem(key, JSON.stringify(this.items));
      } catch (err) {
        console.warn('Failed to save cart to localStorage:', err);
      }
      this.updateBadges();
      this.renderDrawer();
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: this.items } }));
    },

    // --- Query item quantity for card buttons & indicators ---
    getItemQuantity(productId, variantWeight) {
      if (!this.items || this.items.length === 0) return 0;
      if (variantWeight) {
        const item = this.items.find(it => it.productId === productId && it.weight === variantWeight);
        return item ? item.quantity : 0;
      }
      return this.items
        .filter(it => it.productId === productId)
        .reduce((sum, it) => sum + it.quantity, 0);
    },

    // --- Cart Actions ---
    addItem(productId, variantIndex = 0, quantity = 1, options = {}) {
      // 1. Mandatory Sign In / Registration Gate
      if (!window.CustomerAuth || !window.CustomerAuth.isLoggedIn()) {
        const product = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA.find(p => p.id === productId) : null;
        const prodName = product ? product.name : 'this spice';
        
        window.CustomerAuth.requireAuth({
          reason: `Please sign in or create an account to add ${prodName} to your personal basket.`,
          pendingAction: { productId, variantIndex, quantity }
        });
        return false;
      }

      if (typeof PRODUCTS_DATA === 'undefined') return false;
      const product = PRODUCTS_DATA.find(p => p.id === productId);
      if (!product) return false;

      const variants = product.variants && product.variants.length > 0
        ? product.variants
        : [{ weight: '100g', price: 60 }];

      let resolvedIndex = typeof variantIndex === 'number' ? variantIndex : 0;
      if (resolvedIndex < 0 || resolvedIndex >= variants.length) resolvedIndex = 0;
      const variant = variants[resolvedIndex];

      const itemKey = `${product.id}_${variant.weight}`;
      const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

      const existing = this.items.find(item => item.key === itemKey);
      if (existing) {
        existing.quantity += qtyToAdd;
      } else {
        this.items.push({
          key: itemKey,
          productId: product.id,
          name: product.name,
          categoryName: product.categoryName || 'Pure Spice',
          weight: variant.weight,
          price: variant.price,
          quantity: qtyToAdd,
          image: product.image || 'assets/images/products/sambar-masala.png'
        });
      }

      this.saveCart();

      if (!options.silent) {
        this.showToast(`Added <strong>${product.name} (${variant.weight})</strong> x ${qtyToAdd} to your basket!`);
        this.animateBadge();
      }

      // Immediately slide open the cart drawer so client can see the products!
      this.openCart();

      return true;
    },

    updateQuantity(itemKey, delta) {
      const index = this.items.findIndex(item => item.key === itemKey);
      if (index === -1) return;

      this.items[index].quantity += delta;
      if (this.items[index].quantity <= 0) {
        const removed = this.items.splice(index, 1)[0];
        this.showToast(`Removed <strong>${removed.name}</strong> from your basket`);
      }
      this.saveCart();
    },

    removeItem(itemKey) {
      const index = this.items.findIndex(item => item.key === itemKey);
      if (index !== -1) {
        const removed = this.items.splice(index, 1)[0];
        this.saveCart();
        this.showToast(`Removed <strong>${removed.name} (${removed.weight})</strong>`);
      }
    },

    clearCart() {
      if (this.items.length === 0) return;
      this.items = [];
      this.saveCart();
      this.showToast('Your spice basket has been emptied.');
    },

    // --- Calculations ---
    getTotals() {
      let count = 0;
      let subtotal = 0;

      this.items.forEach(item => {
        count += item.quantity;
        subtotal += item.price * item.quantity;
      });

      return {
        itemCount: count,
        subtotal,
        grandTotal: subtotal
      };
    },

    // --- UI Synchronization ---
    updateBadges() {
      const { itemCount } = this.getTotals();
      const badgeEls = document.querySelectorAll('.cart-nav-badge, #cartBadge, #mobileCartBadge, .mobile-cart-badge');
      badgeEls.forEach(el => {
        el.textContent = itemCount;
        if (itemCount > 0) {
          el.classList.add('has-items');
        } else {
          el.classList.remove('has-items');
        }
      });
    },

    animateBadge() {
      const badgeEls = document.querySelectorAll('.cart-nav-badge, #cartBadge, #mobileCartBadge, .mobile-cart-badge');
      badgeEls.forEach(el => {
        el.classList.remove('badge-bounce');
        void el.offsetWidth; // trigger reflow
        el.classList.add('badge-bounce');
      });
    },

    // --- Slide-out Drawer DOM & Mounting ---
    ensureDrawerDOM() {
      if (document.getElementById('cartDrawer')) return;

      const drawerHTML = `
        <div class="cart-backdrop" id="cartBackdrop" aria-hidden="true"></div>
        <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cartDrawerTitle">
          <!-- Cart Drawer Header -->
          <div class="cart-drawer-header">
            <div class="cart-drawer-title-wrap">
              <i class="fas fa-shopping-bag cart-title-icon"></i>
              <div>
                <h3 id="cartDrawerTitle" class="cart-drawer-title">Spice Basket</h3>
                <span class="cart-drawer-count" id="cartHeaderCount">0 items</span>
              </div>
            </div>
            <button class="cart-close-btn" id="cartCloseBtn" aria-label="Close basket">&times;</button>
          </div>

          <!-- Cart Items View -->
          <div class="cart-drawer-body" id="cartItemsContainer">
            <!-- Dynamically populated -->
          </div>

          <!-- Cart Drawer Footer -->
          <div class="cart-drawer-footer" id="cartDrawerFooter">
            <div class="cart-summary-line">
              <span>Total Items</span>
              <strong id="cartHeaderItemsCount">0</strong>
            </div>
            <div class="cart-summary-line cart-total-line">
              <span>Estimated Order Value</span>
              <strong id="cartGrandTotal">₹0</strong>
            </div>

            <div class="cart-footer-actions">
              <button type="button" class="btn btn-whatsapp btn-block btn-cart-wa" id="btnCartWhatsAppCheckout" title="Order on WhatsApp with all cart products">
                <i class="fab fa-whatsapp"></i> Order on WhatsApp (Send Items)
              </button>
            </div>
            <div class="cart-guarantee-note">
              <i class="fas fa-shield-halved"></i> 100% Contamination-Free Odisha Spices • Fresh Batch Milling
            </div>
          </div>
        </aside>

        <!-- Modern Floating Toast -->
        <div class="cart-toast" id="cartToast" role="status" aria-live="polite">
          <div class="toast-content-wrapper">
            <div class="toast-icon"><i class="fas fa-pepper-hot"></i></div>
            <div class="toast-message" id="cartToastMessage">Item added to basket</div>
          </div>
          <button type="button" class="toast-view-btn" id="toastViewCartBtn">View Basket</button>
        </div>
      `;

      const wrapper = document.createElement('div');
      wrapper.id = 'cartSystemWrapper';
      wrapper.innerHTML = drawerHTML;
      document.body.appendChild(wrapper);
    },

    bindEvents() {
      // Close drawer actions
      const closeBtn = document.getElementById('cartCloseBtn');
      const backdrop = document.getElementById('cartBackdrop');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeCart());
      if (backdrop) backdrop.addEventListener('click', () => this.closeCart());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isCartOpen()) {
          this.closeCart();
        }
      });

      // WhatsApp Checkout
      const waBtn = document.getElementById('btnCartWhatsAppCheckout');
      if (waBtn) {
        waBtn.addEventListener('click', () => this.checkoutViaWhatsApp());
      }

      // Toast click to view cart
      const toastViewBtn = document.getElementById('toastViewCartBtn');
      if (toastViewBtn) {
        toastViewBtn.addEventListener('click', (e) => {
          this.hideToast();
          this.openCart(e);
        });
      }

      // Listen for delegated cart button clicks across the entire site
      document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.cart-nav-btn, .cart-mobile-btn, #cartToggleBtn, .open-cart-btn');
        if (toggleBtn) {
          // If the button already has an inline onclick handler, avoid double-handling
          const onclickAttr = toggleBtn.getAttribute('onclick');
          if (onclickAttr && onclickAttr.includes('CartManager')) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          this.openCart(e);
        }
      });
    },

    // --- Drawer Render Engine ---
    renderDrawer() {
      const container = document.getElementById('cartItemsContainer');
      const headerCount = document.getElementById('cartHeaderCount');
      const itemsCountEl = document.getElementById('cartHeaderItemsCount');
      const grandTotalEl = document.getElementById('cartGrandTotal');
      const footer = document.getElementById('cartDrawerFooter');

      if (!container) return;

      const { itemCount, grandTotal } = this.getTotals();

      if (headerCount) {
        headerCount.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
      }
      if (itemsCountEl) {
        itemsCountEl.textContent = `${itemCount} pack${itemCount === 1 ? '' : 's'}`;
      }

      // Empty State
      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="cart-empty-state">
            <div class="empty-icon-wrap">
              <i class="fas fa-basket-shopping"></i>
            </div>
            <h4>Your spice basket is empty</h4>
            <p>Fill it with our cold-milled, 100% pure authentic Odisha spices & masalas.</p>
            <a href="products.html" class="btn btn-primary btn-sm btn-browse-spices" onclick="CartManager.closeCart()">
              <i class="fas fa-pepper-hot"></i> Browse Our Spices
            </a>
          </div>
        `;
        if (footer) footer.style.display = 'none';
        return;
      }

      // Active Items List - shows each product, pack weight, price, and clear quantity (1, 2, 3)
      if (footer) footer.style.display = 'block';

      container.innerHTML = `
        <div class="cart-items-list">
          ${this.items.map(item => `
            <div class="cart-item-card" data-key="${item.key}">
              <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='assets/images/products/sambar-masala.png'">
              <div class="cart-item-details">
                <div class="cart-item-header">
                  <h4 class="cart-item-name">${item.name}</h4>
                  <button type="button" class="cart-item-remove-btn" onclick="CartManager.removeItem('${item.key}')" title="Remove item" aria-label="Remove ${item.name}">
                    <i class="fas fa-trash-can"></i>
                  </button>
                </div>
                <div class="cart-item-variant">
                  <span class="pack-badge">${item.weight}</span>
                  <span class="unit-price">₹${item.price} each</span>
                </div>
                <div class="cart-item-footer">
                  <div class="qty-stepper-box">
                    <button type="button" class="stepper-btn" onclick="CartManager.updateQuantity('${item.key}', -1)" aria-label="Decrease quantity">
                      <i class="fas fa-minus"></i>
                    </button>
                    <span class="stepper-val">${item.quantity}</span>
                    <button type="button" class="stepper-btn" onclick="CartManager.updateQuantity('${item.key}', 1)" aria-label="Increase quantity">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <strong class="item-line-total">₹${item.price * item.quantity}</strong>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="cart-actions-toolbar">
          <button type="button" class="btn-clear-cart" onclick="CartManager.clearCart()">
            <i class="fas fa-trash-alt"></i> Empty Basket
          </button>
        </div>
      `;

      if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;
    },

    // --- Drawer Visibility ---
    openCart(event) {
      if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
      }

      this.ensureDrawerDOM();
      this.loadCart(); // Always reload freshest cart items
      this.updateBadges();
      this.renderDrawer();

      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartBackdrop');
      if (!drawer || !backdrop) return;

      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('cart-drawer-active');
    },

    closeCart(event) {
      if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
      }

      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartBackdrop');
      if (!drawer || !backdrop) return;

      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('cart-drawer-active');
    },

    toggleCart(event) {
      if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
      }

      if (this.isCartOpen()) {
        this.closeCart(event);
      } else {
        this.openCart(event);
      }
    },

    isCartOpen() {
      const drawer = document.getElementById('cartDrawer');
      return drawer && drawer.classList.contains('open');
    },

    // --- Order Checkout via WhatsApp: Redirects with full cart products ---
    checkoutViaWhatsApp() {
      if (this.items.length === 0) {
        this.showToast('Your basket is empty!');
        return;
      }

      const { itemCount, subtotal } = this.getTotals();
      const user = window.CustomerAuth ? window.CustomerAuth.getCurrentUser() : null;

      let lines = [
        '🌿 *NEW SPICE ORDER - SUBHADARSHINI SPICES* 🌿',
        '--------------------------------------------'
      ];

      if (user && user.name) {
        lines.push(`*Customer:* ${user.name} (${user.phone})`);
        if (user.city) lines.push(`*Location:* ${user.city}`);
        lines.push('--------------------------------------------');
      }

      lines.push('*Ordered Items:*');
      this.items.forEach((item, index) => {
        lines.push(`${index + 1}. *${item.name}* (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}`);
      });

      lines.push('--------------------------------------------');
      lines.push(`*Total Items:* ${itemCount} pack(s)`);
      lines.push(`*Estimated Order Value:* ₹${subtotal}`);
      lines.push('--------------------------------------------');
      lines.push('Please confirm availability and share payment / order dispatch details. Thank you!');

      const encoded = encodeURIComponent(lines.join('\n'));
      const waURL = `https://wa.me/916372585804?text=${encoded}`;
      window.open(waURL, '_blank');
    },

    // --- Toast Notifications ---
    showToast(message) {
      const toast = document.getElementById('cartToast');
      const toastMsg = document.getElementById('cartToastMessage');
      if (!toast || !toastMsg) return;

      toastMsg.innerHTML = message;
      toast.classList.add('visible');

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.hideToast();
      }, 4200);
    },

    hideToast() {
      const toast = document.getElementById('cartToast');
      if (toast) toast.classList.remove('visible');
    }
  };

  // Expose globally
  window.CartManager = CartManager;

  // Global helper for card Add to Cart button
  window.handleCardAddToCart = function (productId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const card = document.getElementById(`card-${productId}`);
    let variantIndex = 0;
    if (card && card.dataset.selectedVariant !== undefined) {
      variantIndex = parseInt(card.dataset.selectedVariant, 10) || 0;
    }

    CartManager.addItem(productId, variantIndex, 1);
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CartManager.init());
  } else {
    CartManager.init();
  }

})(window, document);
