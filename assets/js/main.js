/**
 * SUBHADARSHINI SPICES - MAIN JAVASCRIPT CONTROLLER
 * Subhadarshini Agro Pvt Ltd (Pure Spices, Cold Milling, Direct Enquiries)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileDrawer();
  initProductCatalog();
  initQuickViewModal();
  initHeroStories();
  initFloatingWhatsApp();
  initContactForms();
  initNewsletterForm();
});

// --- Sticky Header & Scroll Effects ---
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// --- Mobile Navigation Drawer ---
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');
  const closeBtn = document.querySelector('.drawer-close');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    toggleBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    toggleBtn.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

// --- Product Catalog Renderer & Filter ---
function initProductCatalog() {
  const gridContainer = document.getElementById('productGrid');
  const countEl = document.getElementById('catalogCount');
  const searchInput = document.getElementById('productSearchInput');
  const categoryTabs = document.querySelectorAll('.cat-tab-btn');

  if (!gridContainer || typeof PRODUCTS_DATA === 'undefined') return;

  let currentCategory = 'all';
  let searchQuery = '';

  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    currentCategory = catParam;
    categoryTabs.forEach(tab => {
      if (tab.dataset.category === catParam) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  function renderProducts() {
    const filtered = PRODUCTS_DATA.filter(item => {
      const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.shortDesc && item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${PRODUCTS_DATA.length} Spices`;
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="catalog-empty">
          <i class="fas fa-seedling"></i>
          <h4>No spices found</h4>
          <p>Try searching for another spice name or select a different category tab.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered.map(product => {
      const defaultVariant = product.variants ? product.variants[0] : { weight: '100g', price: 60 };

      // Heat Meter HTML
      let heatClass = 'mild';
      let heatIcon = '🌱 Pure';
      if (product.heat === 3) {
        heatClass = 'hot';
        heatIcon = '🌶️🌶️🌶️';
      } else if (product.heat === 2) {
        heatClass = 'medium';
        heatIcon = '🌶️🌶️';
      }

      // Available Pack Sizes Badges / Buttons
      const packBadges = (product.variants || []).map((v, idx) => 
        `<button type="button" 
                 class="variant-pill ${idx === 0 ? 'active' : ''}" 
                 onclick="selectCardVariant('${product.id}', ${idx}, event)"
                 data-weight="${v.weight}"
                 data-price="${v.price}"
                 title="Select ${v.weight} pack (₹${v.price})">
           ${v.weight}
         </button>`
      ).join('');

      const waText = encodeURIComponent(`Hello Subhadarshini Spices, I want to order ${product.name} (${defaultVariant.weight} - ₹${defaultVariant.price}).`);

      return `
        <article class="product-card" id="card-${product.id}" data-selected-variant="0">
          <div class="product-thumb-box">
            ${product.badge ? `<span class="badge-tag product-badge ${product.badge === 'Odisha Special' ? 'green' : ''}">${product.badge}</span>` : ''}
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.35rem;">
              <span class="product-category-lbl">${product.categoryName}</span>
              <span class="heat-meter ${heatClass}">${heatIcon} ${product.heatLabel || ''}</span>
            </div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
              ${'<i class="fas fa-star"></i>'.repeat(product.rating || 5)}
              <span class="review-count">(${product.reviews || 95})</span>
            </div>
            <p class="product-short-desc">${product.shortDesc || ''}</p>

            <div style="margin: 0.75rem 0 0.5rem;">
              <span style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display:block; margin-bottom:0.35rem;">Available Packs</span>
              <div style="display:flex; flex-wrap:wrap; gap:0.35rem;" class="card-pack-list">
                ${packBadges}
              </div>
            </div>

            <div class="product-footer">
              <div class="card-price-col">
                <span class="card-price-lbl">Price (${defaultVariant.weight})</span>
                <span class="card-price-val">₹${defaultVariant.price}</span>
              </div>
              <div class="product-footer-actions">
                <button class="btn btn-secondary btn-sm btn-card-details" onclick="openProductModal('${product.id}')" title="Quick View & Details">
                  <i class="fas fa-eye"></i> Details
                </button>
                <a href="https://wa.me/916372585804?text=${waText}" target="_blank" class="btn btn-whatsapp btn-sm btn-card-order" title="Order on WhatsApp">
                  <i class="fab fa-whatsapp"></i> Order
                </a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category || 'all';
      renderProducts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  renderProducts();
}

// Global function to handle variant pack selection directly on product cards
window.selectCardVariant = function(productId, variantIndex, event) {
  if (event) {
    event.stopPropagation();
  }
  if (typeof PRODUCTS_DATA === 'undefined') return;
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product || !product.variants || !product.variants[variantIndex]) return;

  const variant = product.variants[variantIndex];
  const card = document.getElementById(`card-${productId}`);
  if (!card) return;

  card.dataset.selectedVariant = variantIndex;

  // Update pills active state
  const pills = card.querySelectorAll('.variant-pill');
  pills.forEach((pill, idx) => {
    if (idx === variantIndex) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Update price display with quick scale pulse
  const priceVal = card.querySelector('.card-price-val');
  const priceLbl = card.querySelector('.card-price-lbl');
  if (priceVal) {
    priceVal.textContent = `₹${variant.price}`;
    priceVal.style.transform = 'scale(1.22)';
    setTimeout(() => {
      priceVal.style.transform = 'scale(1)';
    }, 150);
  }
  if (priceLbl) {
    priceLbl.textContent = `Price (${variant.weight})`;
    priceLbl.title = `Price (${variant.weight})`;
  }

  // Update WhatsApp order link
  const orderBtn = card.querySelector('.btn-card-order');
  if (orderBtn) {
    const waText = encodeURIComponent(`Hello Subhadarshini Spices, I want to order ${product.name} (${variant.weight} - ₹${variant.price}).`);
    orderBtn.href = `https://wa.me/916372585804?text=${waText}`;
  }
};

// ==========================================================================
// QUICK VIEW MODAL
// ==========================================================================

function initQuickViewModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeProductModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProductModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeProductModal();
    }
  });
}

window.openProductModal = function(productId, initialVariantIndex) {
  const modal = document.getElementById('productModal');
  if (!modal || typeof PRODUCTS_DATA === 'undefined') return;

  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const card = document.getElementById(`card-${productId}`);
  let defaultIndex = 0;
  if (typeof initialVariantIndex === 'number') {
    defaultIndex = initialVariantIndex;
  } else if (card && card.dataset.selectedVariant !== undefined) {
    defaultIndex = parseInt(card.dataset.selectedVariant, 10) || 0;
  }

  const modalMedia = document.getElementById('modalMedia');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalBenefits = document.getElementById('modalBenefits');
  const modalIngredients = document.getElementById('modalIngredients');
  const modalVariants = document.getElementById('modalWeights');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');
  const modalPriceTag = document.getElementById('modalPriceTag');
  const modalWeightTag = document.getElementById('modalWeightTag');

  if (modalMedia) {
    modalMedia.src = product.image;
    modalMedia.alt = product.name;
  }
  if (modalCategory) modalCategory.textContent = product.categoryName;
  if (modalTitle) modalTitle.textContent = product.name;
  if (modalDesc) modalDesc.textContent = product.description;

  if (modalBenefits) {
    modalBenefits.innerHTML = (product.benefits || []).map(b => `
      <li><i class="fas fa-check-circle" style="color:var(--accent-green); margin-right:0.4rem;"></i> ${b}</li>
    `).join('');
  }

  if (modalIngredients) {
    modalIngredients.textContent = product.ingredients || '100% natural, selected whole spices.';
  }

  // Variants in Modal
  const variants = product.variants && product.variants.length > 0 ? product.variants : [{ weight: '100g', price: 60 }];
  if (defaultIndex >= variants.length) defaultIndex = 0;
  let selectedVariant = variants[defaultIndex];

  function updateModalPricingAndLink() {
    if (modalPriceTag) {
      modalPriceTag.textContent = `₹${selectedVariant.price}`;
      modalPriceTag.style.transform = 'scale(1.18)';
      modalPriceTag.style.transition = 'transform 0.15s ease';
      setTimeout(() => { modalPriceTag.style.transform = 'scale(1)'; }, 150);
    }
    if (modalWeightTag) {
      modalWeightTag.textContent = selectedVariant.weight;
      modalWeightTag.style.display = 'inline-block';
    }
    if (modalWhatsAppBtn) {
      const text = encodeURIComponent(`Hello Subhadarshini Spices, I want to order ${product.name} (${selectedVariant.weight} - ₹${selectedVariant.price}).`);
      modalWhatsAppBtn.href = `https://wa.me/916372585804?text=${text}`;
    }
  }

  if (modalVariants) {
    modalVariants.innerHTML = variants.map((v, i) => `
      <button class="variant-btn ${i === defaultIndex ? 'active' : ''}" 
              style="padding:0.45rem 0.9rem; font-size:0.85rem; border: 1.5px solid ${i === defaultIndex ? 'var(--primary)' : 'var(--gray-300)'}; border-radius: var(--radius-sm); cursor:pointer; background: ${i === defaultIndex ? 'var(--primary)' : 'var(--white)'}; color: ${i === defaultIndex ? '#fff' : 'var(--dark-800)'}; font-weight:600; margin-right:0.4rem; margin-bottom:0.4rem; transition:all 0.2s ease;"
              data-index="${i}"
              data-weight="${v.weight}" data-price="${v.price}">
        ${v.weight} - ₹${v.price}
      </button>
    `).join('');

    const btns = modalVariants.querySelectorAll('.variant-btn');
    btns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        btns.forEach(b => {
          b.classList.remove('active');
          b.style.background = 'var(--white)';
          b.style.color = 'var(--dark-800)';
          b.style.borderColor = 'var(--gray-300)';
        });
        btn.classList.add('active');
        btn.style.background = 'var(--primary)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--primary)';
        selectedVariant = variants[index];
        updateModalPricingAndLink();

        // Also keep card in sync
        window.selectCardVariant(productId, index);
      });
    });
  }

  updateModalPricingAndLink();

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeProductModal = function() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
};

// --- Contact Form Submission to Backend (Supabase Cloud Persistence) ---
function initContactForms() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '<i class="fas fa-paper-plane"></i> Send Inquiry Message';

    const payload = {
      name: (contactForm.querySelector('[name="name"]')?.value || '').trim(),
      phone: (contactForm.querySelector('[name="phone"]')?.value || '').trim(),
      email: (contactForm.querySelector('[name="email"]')?.value || '').trim(),
      inquiryType: (contactForm.querySelector('[name="inquiryType"], [name="type"]')?.value || 'General Inquiry').trim(),
      subject: (contactForm.querySelector('[name="subject"]')?.value || '').trim(),
      message: (contactForm.querySelector('[name="message"]')?.value || '').trim()
    };

    if (!payload.name || !payload.phone || !payload.email || !payload.message) {
      showToast('⚠️ Please fill in all required fields (Name, Phone, Email, and Message).');
      return;
    }

    const digitsOnly = payload.phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      showToast('⚠️ Please enter a valid 10-digit mobile number.');
      const phoneInput = contactForm.querySelector('[name="phone"]');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Inquiry...';
    }

    let finalId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        finalId = result.inquiryId || finalId;
        showToast(`✅ Inquiry registered! Reference #${finalId}. Our team will contact you shortly.`);

        // Display inline confirmation card
        const successNotice = document.getElementById('contactSuccessNotice');
        const inqIdEl = document.getElementById('successInquiryId');
        const waBtn = document.getElementById('successWaBtn');
        if (successNotice) {
          if (inqIdEl) inqIdEl.textContent = '#' + finalId;
          if (waBtn) {
            const waText = encodeURIComponent(`Namaskar Subhadarshini Spices, I have submitted an inquiry (Ref #${finalId}) from ${payload.name} regarding "${payload.subject}". Looking forward to hearing from your team.`);
            waBtn.href = `https://wa.me/916372585804?text=${waText}`;
          }
          successNotice.style.display = 'block';
          successNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        contactForm.reset();
      } else {
        throw new Error(result.error || 'Server error occurred while submitting inquiry.');
      }
    } catch (err) {
      console.warn('Inquiry submission error:', err);
      showToast(`⚠️ Could not reach server directly. Please connect with our team on WhatsApp: +91 6372585804`);
      
      // Fallback: Enable instant WhatsApp link
      const successNotice = document.getElementById('contactSuccessNotice');
      if (successNotice) {
        const inqIdEl = document.getElementById('successInquiryId');
        const waBtn = document.getElementById('successWaBtn');
        if (inqIdEl) inqIdEl.textContent = '#' + finalId;
        if (waBtn) {
          const waText = encodeURIComponent(`Namaskar Subhadarshini Spices, I would like to enquire about ${payload.subject}. My name is ${payload.name} (${payload.phone}).`);
          waBtn.href = `https://wa.me/916372585804?text=${waText}`;
        }
        successNotice.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    }
  });
}

// --- Newsletter Subscription Form ---
function initNewsletterForm() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Thank you! ${input.value} has been subscribed to spice recipes and offers.`);
        input.value = '';
      }
    });
  });
}

// --- Lightweight Toast Notification ---
function showToast(message) {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #14110E;
      color: #FFFFFF;
      padding: 1rem 1.6rem;
      border-radius: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.92rem;
      font-weight: 500;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      border-left: 4px solid #D9531E;
      z-index: 9999;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      max-width: 90vw;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 3500);
}

// ==========================================================================
// HERO STORY SWITCHER (ROTATING STORIES & ODIA HERITAGE)
// ==========================================================================

const HERO_STORIES = [
  {
    odiaSubhead: '<i class="fas fa-heart"></i> ଓଡ଼ିଶାର ଖାଣ୍ଟି ସ୍ୱାଦ • The Pure Taste of Odisha',
    title: 'The Soul of Every <span class="text-gradient">Indian Kitchen</span>',
    subtitle: 'Crafted in Odisha with uncompromising purity. From traditional <strong>Odia Dalma Masala</strong> to fragrant <strong>Shahi Biryani blends</strong>, experience authentic taste ground cold in our 10-ton daily capacity facility.',
    img: 'assets/images/products/dalma-powder.png',
    topTitle: 'Farm to Packet',
    topDesc: 'Direct regional sourcing',
    botTitle: 'Lab Certified Purity',
    botDesc: 'Zero artificial colors or dyes'
  },
  {
    odiaSubhead: '<i class="fas fa-certificate"></i> ସୁନା ଭଳି ଶୁଦ୍ଧ ହଳଦୀ • Pure Golden Turmeric',
    title: 'Golden Immunity with <span class="text-gradient">>3.5% Curcumin</span>',
    subtitle: 'Sourced directly from fertile regional farms. Rigorously tested to guarantee zero lead chromate, zero synthetic metanil yellow, and maximum natural therapeutic curcumin.',
    img: 'assets/images/products/turmeric-powder.png',
    topTitle: 'Prime Rhizomes',
    topDesc: 'Hand-sorted high-grade fingers',
    botTitle: 'Heavy Metal Free',
    botDesc: '100% negative for adulterants'
  },
  {
    odiaSubhead: '<i class="fas fa-industry"></i> ନୂତନ ଶୀତଳ ପ୍ରଯୁକ୍ତିବିଦ୍ୟା • Modern Cold Milling',
    title: 'Preserving Fragrant <span class="text-gradient">Essential Spice Oils</span>',
    subtitle: 'Conventional high-heat grinding burns out aroma. Our air-classifying mill in Godisahi, Cuttack grinds spices cold, sealing in 100% natural volatile flavor for your family.',
    img: 'assets/images/products/sambar-masala.png',
    topTitle: '10 Metric Tons / Day',
    topDesc: 'State-of-the-art Cuttack facility',
    botTitle: 'Aroma Retention',
    botDesc: 'Low-temperature sealed grinding'
  }
];

let currentHeroStory = 0;
let heroStoryInterval = null;

function initHeroStories() {
  const heroPackImg = document.getElementById('heroPackImg');
  if (!heroPackImg) return;

  heroStoryInterval = setInterval(() => {
    switchHeroStory((currentHeroStory + 1) % HERO_STORIES.length);
  }, 6000);

  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', () => clearInterval(heroStoryInterval));
    heroSection.addEventListener('mouseleave', () => {
      clearInterval(heroStoryInterval);
      heroStoryInterval = setInterval(() => {
        switchHeroStory((currentHeroStory + 1) % HERO_STORIES.length);
      }, 6000);
    });
  }
}

window.switchHeroStory = function(index) {
  currentHeroStory = index;
  const story = HERO_STORIES[index];
  if (!story) return;

  const buttons = document.querySelectorAll('.story-pill-btn');
  buttons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  const odiaSubhead = document.getElementById('heroOdiaSubhead');
  const title = document.getElementById('heroTitle');
  const subtitle = document.getElementById('heroSubtitle');
  const img = document.getElementById('heroPackImg');
  const topTitle = document.getElementById('heroPillTopTitle');
  const topDesc = document.getElementById('heroPillTopDesc');
  const botTitle = document.getElementById('heroPillBottomTitle');
  const botDesc = document.getElementById('heroPillBottomDesc');

  if (odiaSubhead) odiaSubhead.innerHTML = story.odiaSubhead;
  if (title) title.innerHTML = story.title;
  if (subtitle) subtitle.innerHTML = story.subtitle;
  if (topTitle) topTitle.textContent = story.topTitle;
  if (topDesc) topDesc.textContent = story.topDesc;
  if (botTitle) botTitle.textContent = story.botTitle;
  if (botDesc) botDesc.textContent = story.botDesc;

  if (img) {
    img.style.opacity = '0';
    img.style.transform = 'scale(0.92)';
    setTimeout(() => {
      img.src = story.img;
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    }, 200);
  }
};

// ==========================================================================
// FLOATING WHATSAPP CHAT BUBBLE
// ==========================================================================

function initFloatingWhatsApp() {
  if (document.querySelector('.floating-wa-bubble')) return;
  const bubble = document.createElement('a');
  bubble.className = 'floating-wa-bubble';
  bubble.href = 'https://wa.me/916372585804?text=Hello%20Subhadarshini%20Spices%2C%20I%20have%20an%20enquiry%20about%20your%20products.';
  bubble.target = '_blank';
  bubble.setAttribute('aria-label', 'Chat on WhatsApp with Subhadarshini Spices');
  bubble.innerHTML = '<i class="fab fa-whatsapp"></i>';
  document.body.appendChild(bubble);
}
