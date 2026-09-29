/**
 * SUBHADARSHINI SPICES - CUSTOMER AUTHENTICATION & SESSION MANAGER
 * Handles client sign-in, registration, per-user isolated cart mapping,
 * and header user state across all pages.
 */

(function (window, document) {
  'use strict';

  const SESSION_KEY = 'subhadarshini_active_client';
  const ACCOUNTS_KEY = 'subhadarshini_client_accounts';
  const PENDING_ACTION_KEY = 'subhadarshini_pending_cart_action';

  const CustomerAuth = {
    currentUser: null,

    init() {
      this.loadSession();
      this.ensureAuthModalDOM();
      this.bindEvents();
      this.updateHeaderUI();
      this.checkPendingAction();
    },

    loadSession() {
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        this.currentUser = stored ? JSON.parse(stored) : null;
      } catch (e) {
        this.currentUser = null;
      }
    },

    isLoggedIn() {
      return !!(this.currentUser && this.currentUser.phone);
    },

    getCurrentUser() {
      return this.currentUser;
    },

    getAccounts() {
      try {
        const accs = localStorage.getItem(ACCOUNTS_KEY);
        return accs ? JSON.parse(accs) : [];
      } catch (e) {
        return [];
      }
    },

    saveAccounts(accounts) {
      try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      } catch (e) {}
    },

    // --- Register a new Client ---
    register(name, phone, password, city = '') {
      const cleanName = String(name || '').trim();
      const cleanPhone = String(phone || '').replace(/\D/g, '').trim();
      const cleanPass = String(password || '').trim();

      if (!cleanName || cleanName.length < 2) {
        return { success: false, error: 'Please enter your full name.' };
      }
      if (!cleanPhone || cleanPhone.length !== 10) {
        return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
      }
      if (!cleanPass || cleanPass.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters.' };
      }

      const accounts = this.getAccounts();
      const existing = accounts.find(a => a.phone === cleanPhone);
      if (existing) {
        return { success: false, error: 'An account with this mobile number already exists. Please Sign In.' };
      }

      const newAccount = {
        name: cleanName,
        phone: cleanPhone,
        password: cleanPass,
        city: city.trim(),
        createdAt: new Date().toISOString()
      };

      accounts.push(newAccount);
      this.saveAccounts(accounts);

      // Log in immediately
      return this.login(cleanPhone, cleanPass);
    },

    // --- Sign In Existing Client ---
    login(phone, password) {
      const cleanPhone = String(phone || '').replace(/\D/g, '').trim();
      const cleanPass = String(password || '').trim();

      if (!cleanPhone || cleanPhone.length !== 10) {
        return { success: false, error: 'Please enter your 10-digit mobile number.' };
      }
      if (!cleanPass) {
        return { success: false, error: 'Please enter your password.' };
      }

      const accounts = this.getAccounts();
      let account = accounts.find(a => a.phone === cleanPhone);

      // Allow demo / quick client account auto-creation if not found
      if (!account) {
        account = {
          name: 'Valued Customer',
          phone: cleanPhone,
          password: cleanPass,
          createdAt: new Date().toISOString()
        };
        accounts.push(account);
        this.saveAccounts(accounts);
      } else if (account.password && account.password !== cleanPass) {
        return { success: false, error: 'Incorrect password for this mobile number.' };
      }

      this.currentUser = {
        name: account.name,
        phone: account.phone,
        city: account.city || '',
        loggedInAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
      } catch (e) {}

      this.updateHeaderUI();

      // Notify CartManager that user changed so it loads their specific individual cart!
      window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: this.currentUser } }));

      // Execute pending action if any
      this.checkPendingAction();

      return { success: true, user: this.currentUser };
    },

    // --- Log Out ---
    logout() {
      this.currentUser = null;
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch (e) {}

      this.updateHeaderUI();
      window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: { user: null } }));

      if (window.CartManager) {
        window.CartManager.loadCart();
        window.CartManager.updateBadges();
        window.CartManager.renderDrawer();
      }

      if (window.location.pathname.endsWith('login.html')) {
        window.location.reload();
      }
    },

    // --- Require Auth Gate for Add to Cart ---
    requireAuth(options = {}) {
      if (this.isLoggedIn()) {
        if (typeof options.onSuccess === 'function') {
          options.onSuccess(this.currentUser);
        }
        return true;
      }

      // Store pending action
      if (options.pendingAction) {
        try {
          sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(options.pendingAction));
        } catch (e) {}
      }

      // Redirect to login page or open modal
      if (options.preferRedirect) {
        const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${redirectUrl}`;
      } else {
        this.openAuthModal(options.reason || 'Please sign in or create an account to add spices to your personal basket.');
      }

      return false;
    },

    // --- Check & Resume Pending Cart Action after Login ---
    checkPendingAction() {
      if (!this.isLoggedIn()) return;
      try {
        const stored = sessionStorage.getItem(PENDING_ACTION_KEY);
        if (stored) {
          sessionStorage.removeItem(PENDING_ACTION_KEY);
          const action = JSON.parse(stored);
          if (action && action.productId && window.CartManager) {
            setTimeout(() => {
              window.CartManager.addItem(action.productId, action.variantIndex || 0, action.quantity || 1, { openDrawer: true });
            }, 300);
          }
        }
      } catch (e) {}
    },

    // --- Update Header Navigation UI ---
    updateHeaderUI() {
      const navActions = document.querySelectorAll('.nav-actions');
      navActions.forEach(container => {
        let authWrapper = container.querySelector('.nav-auth-wrapper');
        if (!authWrapper) {
          authWrapper = document.createElement('div');
          authWrapper.className = 'nav-auth-wrapper';
          // Insert before cart button or toggle
          const cartBtn = container.querySelector('.cart-nav-btn');
          if (cartBtn) {
            container.insertBefore(authWrapper, cartBtn);
          } else {
            container.prepend(authWrapper);
          }
        }

        if (this.isLoggedIn()) {
          const firstName = (this.currentUser.name || 'Account').split(' ')[0];
          authWrapper.innerHTML = `
            <div class="user-chip-menu">
              <button type="button" class="btn-user-chip" id="btnUserChip" title="Account: ${this.currentUser.phone}">
                <i class="fas fa-circle-user"></i>
                <span class="user-chip-name">${firstName}</span>
                <i class="fas fa-chevron-down user-chip-arrow"></i>
              </button>
              <div class="user-dropdown-menu" id="userDropdownMenu">
                <div class="dropdown-header">
                  <strong>${this.currentUser.name}</strong>
                  <small>${this.currentUser.phone}</small>
                </div>
                <div class="dropdown-divider"></div>
                <a href="products.html" class="dropdown-item"><i class="fas fa-pepper-hot"></i> Browse Spices</a>
                <button type="button" class="dropdown-item" onclick="CartManager.openCart()"><i class="fas fa-shopping-bag"></i> My Spice Basket</button>
                <div class="dropdown-divider"></div>
                <button type="button" class="dropdown-item logout-link" onclick="CustomerAuth.logout()"><i class="fas fa-right-from-bracket"></i> Sign Out</button>
              </div>
            </div>
          `;

          const chip = authWrapper.querySelector('#btnUserChip');
          const menu = authWrapper.querySelector('#userDropdownMenu');
          if (chip && menu) {
            chip.addEventListener('click', (e) => {
              e.stopPropagation();
              menu.classList.toggle('active');
            });
            document.addEventListener('click', () => menu.classList.remove('active'));
          }
        } else {
          authWrapper.innerHTML = `
            <button type="button" class="btn-nav-signin" onclick="CustomerAuth.openAuthModal('Please sign in to access your personal spice basket.')" title="Sign In or Register">
              <i class="fas fa-user"></i>
              <span>Sign In</span>
            </button>
          `;
        }
      });
    },

    // --- Modal Auth Dialog ---
    ensureAuthModalDOM() {
      if (document.getElementById('customerAuthModal')) return;

      const modalHTML = `
        <div class="customer-auth-backdrop" id="customerAuthBackdrop"></div>
        <div class="customer-auth-modal" id="customerAuthModal" role="dialog" aria-modal="true">
          <button type="button" class="auth-modal-close" id="authModalClose" aria-label="Close">&times;</button>
          <div class="auth-modal-header">
            <img src="assets/images/logo/logo.png" alt="Subhadarshini Spices" style="height: 44px; margin-bottom: 0.5rem;">
            <h3 id="authModalTitle">Welcome to Subhadarshini</h3>
            <p id="authModalSubtitle">Sign in to add spices to your personal basket and place orders.</p>
          </div>

          <!-- Auth Tabs -->
          <div class="auth-tabs">
            <button type="button" class="auth-tab-btn active" id="tabSignInBtn">Sign In</button>
            <button type="button" class="auth-tab-btn" id="tabRegisterBtn">New Account</button>
          </div>

          <!-- Alert / Error message -->
          <div class="auth-alert" id="authAlert" style="display: none;"></div>

          <!-- Sign In Form -->
          <form id="clientSignInForm" class="auth-form-panel">
            <div class="form-group-sm">
              <label for="modalLoginPhone"><i class="fas fa-phone-alt"></i> 10-Digit Mobile Number *</label>
              <input type="tel" id="modalLoginPhone" placeholder="e.g. 9876543210" maxlength="10" required pattern="[0-9]{10}">
            </div>
            <div class="form-group-sm">
              <label for="modalLoginPass"><i class="fas fa-lock"></i> Password / PIN *</label>
              <input type="password" id="modalLoginPass" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 0.5rem;">
              <i class="fas fa-right-to-bracket"></i> Sign In to Basket
            </button>
          </form>

          <!-- Register Form -->
          <form id="clientRegisterForm" class="auth-form-panel" style="display: none;">
            <div class="form-group-sm">
              <label for="modalRegName"><i class="fas fa-user"></i> Full Name *</label>
              <input type="text" id="modalRegName" placeholder="Your full name" required>
            </div>
            <div class="form-group-sm">
              <label for="modalRegPhone"><i class="fas fa-phone-alt"></i> 10-Digit Mobile Number *</label>
              <input type="tel" id="modalRegPhone" placeholder="e.g. 9876543210" maxlength="10" required pattern="[0-9]{10}">
            </div>
            <div class="form-group-sm">
              <label for="modalRegCity"><i class="fas fa-location-dot"></i> City / Town (Optional)</label>
              <input type="text" id="modalRegCity" placeholder="e.g. Bhubaneswar, Cuttack">
            </div>
            <div class="form-group-sm">
              <label for="modalRegPass"><i class="fas fa-lock"></i> Create Password *</label>
              <input type="password" id="modalRegPass" placeholder="At least 4 characters" minlength="4" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 0.5rem;">
              <i class="fas fa-user-plus"></i> Create Account & Proceed
            </button>
          </form>

          <div class="auth-modal-footer">
            <p><i class="fas fa-shield-halved" style="color: var(--accent-green);"></i> Individual secure account & personal spice basket</p>
          </div>
        </div>
      `;

      const wrapper = document.createElement('div');
      wrapper.id = 'authSystemWrapper';
      wrapper.innerHTML = modalHTML;
      document.body.appendChild(wrapper);
    },

    bindEvents() {
      const backdrop = document.getElementById('customerAuthBackdrop');
      const closeBtn = document.getElementById('authModalClose');
      const tabSignIn = document.getElementById('tabSignInBtn');
      const tabReg = document.getElementById('tabRegisterBtn');
      const signInForm = document.getElementById('clientSignInForm');
      const regForm = document.getElementById('clientRegisterForm');
      const alertBox = document.getElementById('authAlert');

      if (backdrop) backdrop.addEventListener('click', () => this.closeAuthModal());
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeAuthModal());

      if (tabSignIn && tabReg && signInForm && regForm) {
        tabSignIn.addEventListener('click', () => {
          tabSignIn.classList.add('active');
          tabReg.classList.remove('active');
          signInForm.style.display = 'block';
          regForm.style.display = 'none';
          if (alertBox) alertBox.style.display = 'none';
        });

        tabReg.addEventListener('click', () => {
          tabReg.classList.add('active');
          tabSignIn.classList.remove('active');
          signInForm.style.display = 'none';
          regForm.style.display = 'block';
          if (alertBox) alertBox.style.display = 'none';
        });
      }

      if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const phone = document.getElementById('modalLoginPhone').value;
          const pass = document.getElementById('modalLoginPass').value;
          const res = this.login(phone, pass);
          if (res.success) {
            this.closeAuthModal();
            if (window.CartManager) {
              window.CartManager.showToast(`Welcome back, <strong>${res.user.name}</strong>!`);
            }
          } else {
            this.showAuthAlert(res.error);
          }
        });
      }

      if (regForm) {
        regForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('modalRegName').value;
          const phone = document.getElementById('modalRegPhone').value;
          const city = document.getElementById('modalRegCity').value;
          const pass = document.getElementById('modalRegPass').value;
          const res = this.register(name, phone, pass, city);
          if (res.success) {
            this.closeAuthModal();
            if (window.CartManager) {
              window.CartManager.showToast(`Account created! Welcome, <strong>${res.user.name}</strong>.`);
            }
          } else {
            this.showAuthAlert(res.error);
          }
        });
      }
    },

    openAuthModal(reason = '') {
      const modal = document.getElementById('customerAuthModal');
      const backdrop = document.getElementById('customerAuthBackdrop');
      const sub = document.getElementById('authModalSubtitle');
      const alertBox = document.getElementById('authAlert');

      if (!modal || !backdrop) return;
      if (reason && sub) sub.textContent = reason;
      if (alertBox) alertBox.style.display = 'none';

      modal.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('auth-modal-active');
    },

    closeAuthModal() {
      const modal = document.getElementById('customerAuthModal');
      const backdrop = document.getElementById('customerAuthBackdrop');
      if (!modal || !backdrop) return;
      modal.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('auth-modal-active');
    },

    showAuthAlert(message) {
      const alertBox = document.getElementById('authAlert');
      if (!alertBox) return;
      alertBox.textContent = message;
      alertBox.style.display = 'block';
    }
  };

  // Expose globally
  window.CustomerAuth = CustomerAuth;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CustomerAuth.init());
  } else {
    CustomerAuth.init();
  }

})(window, document);
