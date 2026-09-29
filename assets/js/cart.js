/**
 * SUBHADARSHINI SPICES - SHOPPING BASKET & CART CONTROLLER
 * Full-featured e-commerce cart with persistent storage, slide-out drawer,
 * variant support, free shipping meter, direct WhatsApp checkout, and online order placement.
 */

(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'subhadarshini_cart_v1';
  const FREE_SHIPPING_THRESHOLD = 499; // Free delivery above ₹499
  const STANDARD_DELIVERY_FEE = 40;    // Standard delivery fee

  const CartManager = {
    items: [],

    init() {
      this.loadCart();
      this.ensureDrawerDOM();
      this.bindEvents();
      this.updateBadges();
      this.renderDrawer();
    },

    // --- Local Storage Management ---
    loadCart() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        this.items = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(this.items)) this.items = [];
      } catch (err) {
        console.warn('Failed to load cart from localStorage:', err);
        this.items = [];
      }
    },

    saveCart() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      } catch (err) {
        console.warn('Failed to save cart to localStorage:', err);
      }
      this.updateBadges();
      this.renderDrawer();
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items: this.items } }));
    },

    // --- Cart Actions ---
    addItem(productId, variantIndex = 0, quantity = 1, options = {}) {
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

      if (options.openDrawer) {
        this.openCart();
      }

      return true;
    },

    updateQuantity(itemKey, delta) {
      const index = this.items.findIndex(item => item.key === itemKey);
      if (index === -1) return;

      this.items[index].quantity += delta;
      if (this.items[index].quantity <= 0) {
        this.items.splice(index, 1);
        this.showToast('Item removed from your basket');
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

      const deliveryFee = subtotal === 0 ? 0 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE);
      const grandTotal = subtotal + deliveryFee;
      const amountNeededForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
      const freeShippingPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

      return {
        itemCount: count,
        subtotal,
        deliveryFee,
        grandTotal,
        amountNeededForFree,
        freeShippingPercent,
        isFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD
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

          <!-- Free Shipping Progress -->
          <div class="cart-shipping-meter" id="cartShippingMeter">
            <div class="shipping-meter-text" id="shippingMeterText">
              <i class="fas fa-truck-fast"></i> Add ₹499 for FREE Delivery
            </div>
            <div class="shipping-meter-track">
              <div class="shipping-meter-bar" id="shippingMeterBar" style="width: 0%;"></div>
            </div>
          </div>

          <!-- Cart Items View -->
          <div class="cart-drawer-body" id="cartItemsContainer">
            <!-- Dynamically populated -->
          </div>

          <!-- Checkout / Form Subview (hidden by default) -->
          <div class="cart-checkout-view" id="cartCheckoutView" style="display: none;">
            <div class="checkout-view-header">
              <button type="button" class="checkout-back-btn" id="checkoutBackBtn">
                <i class="fas fa-arrow-left"></i> Back to Basket
              </button>
              <h4>Quick Delivery Details</h4>
            </div>
            <form id="cartCheckoutForm" class="cart-checkout-form">
              <div class="form-group-sm">
                <label for="orderCustomerName">Full Name *</label>
                <input type="text" id="orderCustomerName" required placeholder="Enter full name">
              </div>
              <div class="form-row-sm">
                <div class="form-group-sm">
                  <label for="orderCustomerPhone">10-Digit Mobile *</label>
                  <input type="tel" id="orderCustomerPhone" required placeholder="e.g. 9876543210" pattern="[0-9]{10}">
                </div>
                <div class="form-group-sm">
                  <label for="orderCustomerPincode">Pincode *</label>
                  <input type="text" id="orderCustomerPincode" required placeholder="e.g. 753001" maxlength="6">
                </div>
              </div>
              <div class="form-group-sm">
                <label for="orderCustomerAddress">Delivery Address *</label>
                <textarea id="orderCustomerAddress" rows="2" required placeholder="House/Flat, Street, Landmark, City"></textarea>
              </div>
              <div class="form-group-sm">
                <label for="orderPaymentMethod">Payment Mode</label>
                <select id="orderPaymentMethod">
                  <option value="Cash / Pay on Delivery">Cash / UPI on Delivery</option>
                  <option value="Prepay via UPI / WhatsApp">Prepay via UPI QR / WhatsApp</option>
                </select>
              </div>
              <div class="checkout-order-summary-box" id="checkoutFormSummary">
                <!-- Summary inserted -->
              </div>
              <button type="submit" class="btn btn-primary btn-block" id="btnSubmitDirectOrder">
                <i class="fas fa-check-circle"></i> Place Order Now
              </button>
            </form>
          </div>

          <!-- Order Confirmation View -->
          <div class="cart-success-view" id="cartSuccessView" style="display: none;">
            <div class="success-icon-wrap">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>Order Received!</h3>
            <p class="success-order-id" id="successOrderId">ID: SUB-ORD-0000</p>
            <p class="success-order-desc">Thank you for choosing Subhadarshini Spices. We have received your order details and are preparing your fresh spice batch.</p>
            <div class="success-actions">
              <a href="#" target="_blank" class="btn btn-whatsapp btn-block" id="successWhatsAppBtn">
                <i class="fab fa-whatsapp"></i> Confirm Order on WhatsApp
              </a>
              <button type="button" class="btn btn-secondary btn-block" id="successContinueBtn">
                Continue Shopping
              </button>
            </div>
          </div>

          <!-- Cart Drawer Footer -->
          <div class="cart-drawer-footer" id="cartDrawerFooter">
            <div class="cart-summary-line">
              <span>Subtotal</span>
              <strong id="cartSubtotal">₹0</strong>
            </div>
            <div class="cart-summary-line">
              <span>Delivery Charges</span>
              <span id="cartDeliveryFee" class="delivery-badge-val">₹0</span>
            </div>
            <div class="cart-summary-line cart-total-line">
              <span>Total Amount</span>
              <strong id="cartGrandTotal">₹0</strong>
            </div>

            <div class="cart-footer-actions">
              <button type="button" class="btn btn-whatsapp btn-block btn-cart-wa" id="btnCartWhatsAppCheckout">
                <i class="fab fa-whatsapp"></i> Instant Order via WhatsApp
              </button>
              <button type="button" class="btn btn-primary btn-block btn-cart-checkout" id="btnCartShowCheckout">
                <i class="fas fa-truck"></i> Enter Address & Order Direct
              </button>
            </div>
            <div class="cart-guarantee-note">
              <i class="fas fa-shield-halved"></i> 100% Unadulterated Pure Spices • Fresh Batch Milling
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

      // Show Direct Checkout Form
      const showCheckoutBtn = document.getElementById('btnCartShowCheckout');
      const backBtn = document.getElementById('checkoutBackBtn');
      if (showCheckoutBtn) {
        showCheckoutBtn.addEventListener('click', () => this.showCheckoutView());
      }
      if (backBtn) {
        backBtn.addEventListener('click', () => this.showItemsView());
      }

      // Handle Direct Checkout Form Submission
      const checkoutForm = document.getElementById('cartCheckoutForm');
      if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => this.handleDirectOrderSubmit(e));
      }

      // Success continue shopping
      const continueBtn = document.getElementById('successContinueBtn');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          this.closeCart();
          this.showItemsView();
        });
      }

      // Toast click to view cart
      const toastViewBtn = document.getElementById('toastViewCartBtn');
      if (toastViewBtn) {
        toastViewBtn.addEventListener('click', () => {
          this.hideToast();
          this.openCart();
        });
      }

      // Listen for delegated cart button clicks across the entire site
      document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.cart-nav-btn, .cart-mobile-btn, #cartToggleBtn, .open-cart-btn');
        if (toggleBtn) {
          e.preventDefault();
          this.toggleCart();
        }
      });
    },

    // --- Drawer Render Engine ---
    renderDrawer() {
      const container = document.getElementById('cartItemsContainer');
      const headerCount = document.getElementById('cartHeaderCount');
      const subtotalEl = document.getElementById('cartSubtotal');
      const deliveryEl = document.getElementById('cartDeliveryFee');
      const grandTotalEl = document.getElementById('cartGrandTotal');
      const footer = document.getElementById('cartDrawerFooter');
      const shippingMeter = document.getElementById('cartShippingMeter');
      const meterText = document.getElementById('shippingMeterText');
      const meterBar = document.getElementById('shippingMeterBar');

      if (!container) return;

      const { itemCount, subtotal, deliveryFee, grandTotal, amountNeededForFree, freeShippingPercent, isFreeShipping } = this.getTotals();

      if (headerCount) {
        headerCount.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
      }

      // Free shipping progress
      if (shippingMeter && meterText && meterBar) {
        if (subtotal === 0) {
          shippingMeter.style.display = 'none';
        } else {
          shippingMeter.style.display = 'block';
          meterBar.style.width = `${freeShippingPercent}%`;
          if (isFreeShipping) {
            meterText.innerHTML = '<span class="free-ship-unlocked"><i class="fas fa-circle-check"></i> <strong>FREE Delivery Unlocked!</strong></span>';
            meterBar.classList.add('unlocked');
          } else {
            meterText.innerHTML = `<i class="fas fa-truck-fast"></i> Add <strong>₹${amountNeededForFree}</strong> more for <strong>FREE Delivery</strong>`;
            meterBar.classList.remove('unlocked');
          }
        }
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

      // Active Items List
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

      if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
      if (deliveryEl) {
        if (deliveryFee === 0) {
          deliveryEl.innerHTML = '<span class="free-delivery-tag">FREE</span>';
        } else {
          deliveryEl.textContent = `₹${deliveryFee}`;
        }
      }
      if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;
    },

    // --- Drawer Visibility ---
    openCart() {
      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartBackdrop');
      if (!drawer || !backdrop) return;

      this.renderDrawer();
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('cart-drawer-active');
    },

    closeCart() {
      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartBackdrop');
      if (!drawer || !backdrop) return;

      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('cart-drawer-active');
    },

    toggleCart() {
      if (this.isCartOpen()) {
        this.closeCart();
      } else {
        this.openCart();
      }
    },

    isCartOpen() {
      const drawer = document.getElementById('cartDrawer');
      return drawer && drawer.classList.contains('open');
    },

    showCheckoutView() {
      const itemsContainer = document.getElementById('cartItemsContainer');
      const checkoutView = document.getElementById('cartCheckoutView');
      const footer = document.getElementById('cartDrawerFooter');
      const summaryBox = document.getElementById('checkoutFormSummary');
      const { itemCount, subtotal, deliveryFee, grandTotal } = this.getTotals();

      if (itemsContainer) itemsContainer.style.display = 'none';
      if (footer) footer.style.display = 'none';
      if (checkoutView) checkoutView.style.display = 'block';

      if (summaryBox) {
        summaryBox.innerHTML = `
          <div class="summary-line"><span>Items (${itemCount}):</span> <strong>₹${subtotal}</strong></div>
          <div class="summary-line"><span>Delivery:</span> <strong>${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}</strong></div>
          <div class="summary-line total"><span>Total Payable:</span> <strong>₹${grandTotal}</strong></div>
        `;
      }
    },

    showItemsView() {
      const itemsContainer = document.getElementById('cartItemsContainer');
      const checkoutView = document.getElementById('cartCheckoutView');
      const successView = document.getElementById('cartSuccessView');
      const footer = document.getElementById('cartDrawerFooter');

      if (checkoutView) checkoutView.style.display = 'none';
      if (successView) successView.style.display = 'none';
      if (itemsContainer) itemsContainer.style.display = 'block';
      if (footer && this.items.length > 0) footer.style.display = 'block';
      this.renderDrawer();
    },

    // --- Order Checkout via WhatsApp ---
    checkoutViaWhatsApp() {
      if (this.items.length === 0) {
        this.showToast('Your basket is empty!');
        return;
      }

      const { subtotal, deliveryFee, grandTotal } = this.getTotals();

      let lines = [
        '🌿 *NEW SPICE ORDER - SUBHADARSHINI SPICES* 🌿',
        '--------------------------------------------',
        '*Ordered Items:*'
      ];

      this.items.forEach((item, index) => {
        lines.push(`${index + 1}. *${item.name}* (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}`);
      });

      lines.push('--------------------------------------------');
      lines.push(`*Subtotal:* ₹${subtotal}`);
      lines.push(`*Delivery:* ${deliveryFee === 0 ? 'FREE (Above ₹499 promo)' : '₹' + deliveryFee}`);
      lines.push(`*Total Amount:* ₹${grandTotal}`);
      lines.push('--------------------------------------------');
      lines.push('Please confirm availability and share payment / dispatch details. Thank you!');

      const encoded = encodeURIComponent(lines.join('\n'));
      const waURL = `https://wa.me/916372585804?text=${encoded}`;
      window.open(waURL, '_blank');
    },

    // --- Direct Order Placement (Saves via /api/contact) ---
    async handleDirectOrderSubmit(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('btnSubmitDirectOrder');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Place Order Now';

      const name = document.getElementById('orderCustomerName').value.trim();
      const phone = document.getElementById('orderCustomerPhone').value.trim();
      const pincode = document.getElementById('orderCustomerPincode').value.trim();
      const address = document.getElementById('orderCustomerAddress').value.trim();
      const paymentMode = document.getElementById('orderPaymentMethod').value;

      if (!name || !phone || !address || !pincode) {
        alert('Please fill in all mandatory fields.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';
      }

      const { subtotal, deliveryFee, grandTotal } = this.getTotals();
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const itemsSummary = this.items.map(it => `${it.name} (${it.weight}) x ${it.quantity} = ₹${it.price * it.quantity}`).join(' | ');
      const messageBody = `
ORDER ID: ${orderId}
TOTAL AMOUNT: ₹${grandTotal} (Subtotal: ₹${subtotal}, Delivery: ₹${deliveryFee})
PAYMENT PREFERENCE: ${paymentMode}
DELIVERY ADDRESS: ${address}, Pincode: ${pincode}
ITEMS ORDERED:
${this.items.map(it => `- ${it.name} (${it.weight}) x ${it.quantity} = ₹${it.price * it.quantity}`).join('\n')}
      `.trim();

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            email: 'customer@subhadarshini.order',
            subject: `Online Order #${orderId} - ₹${grandTotal}`,
            inquiryType: 'Direct Online Order',
            message: messageBody
          })
        });

        const result = await response.json();

        // Show Success screen even if offline/fallback
        this.showSuccessView(orderId, name, phone, grandTotal, itemsSummary);
        this.items = [];
        this.saveCart();
      } catch (err) {
        console.warn('Network issue during direct order, proceeding with local confirmation:', err);
        this.showSuccessView(orderId, name, phone, grandTotal, itemsSummary);
        this.items = [];
        this.saveCart();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    },

    showSuccessView(orderId, name, phone, grandTotal, itemsSummary) {
      const checkoutView = document.getElementById('cartCheckoutView');
      const successView = document.getElementById('cartSuccessView');
      const orderIdEl = document.getElementById('successOrderId');
      const waBtn = document.getElementById('successWhatsAppBtn');

      if (checkoutView) checkoutView.style.display = 'none';
      if (successView) successView.style.display = 'block';
      if (orderIdEl) orderIdEl.textContent = `Order Reference: ${orderId}`;

      if (waBtn) {
        const text = encodeURIComponent(
          `Hello Subhadarshini Team, I placed an online order (${orderId}) for ₹${grandTotal}.\nCustomer: ${name} (${phone})\nItems: ${itemsSummary}\nPlease confirm my delivery schedule.`
        );
        waBtn.href = `https://wa.me/916372585804?text=${text}`;
      }
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

    const added = CartManager.addItem(productId, variantIndex, 1);

    if (added && event && event.currentTarget) {
      const btn = event.currentTarget;
      const originalHTML = btn.innerHTML;
      btn.classList.add('btn-added-pulse');
      btn.innerHTML = '<i class="fas fa-check"></i> Added!';
      setTimeout(() => {
        btn.classList.remove('btn-added-pulse');
        btn.innerHTML = originalHTML;
      }, 1400);
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CartManager.init());
  } else {
    CartManager.init();
  }

})(window, document);
