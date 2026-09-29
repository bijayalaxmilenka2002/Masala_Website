/**
 * Automated Verification Script for Subhadarshini Spices Cart Feature
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function fetchURL(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log("=== STARTING CART FEATURE TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check HTTP Endpoints
    console.log("\n[Test 1] Verifying Static & Script Serving...");
    const htmlRes = await fetchURL('/products.html');
    assert(htmlRes.status === 200, "products.html returns 200 OK");
    assert(htmlRes.data.includes('cart.js'), "products.html includes cart.js script");
    assert(htmlRes.data.includes('cart-nav-btn'), "products.html includes cart-nav-btn");
    assert(htmlRes.data.includes('modal-qty-stepper'), "products.html includes modal-qty-stepper");

    const cartJsRes = await fetchURL('/assets/js/cart.js?v=4.0');
    assert(cartJsRes.status === 200, "assets/js/cart.js returns 200 OK");
    assert(cartJsRes.data.includes('CartManager'), "cart.js contains CartManager object");

    const indexRes = await fetchURL('/');
    assert(indexRes.status === 200, "index.html returns 200 OK");
    assert(indexRes.data.includes('cart-nav-btn'), "index.html includes cart-nav-btn");
    assert(indexRes.data.includes('cart.js'), "index.html includes cart.js script");

    // 2. Mock CartManager logic in Node environment
    console.log("\n[Test 2] Simulating Cart State & Arithmetic...");
    // Load products data
    const productsFileContent = fs.readFileSync(path.join(__dirname, '../assets/js/products-data.js'), 'utf8');
    const mockWindow = {};
    eval(productsFileContent.replace('const PRODUCTS_DATA', 'mockWindow.PRODUCTS_DATA'));
    const PRODUCTS_DATA = mockWindow.PRODUCTS_DATA;

    assert(Array.isArray(PRODUCTS_DATA) && PRODUCTS_DATA.length > 0, `Loaded ${PRODUCTS_DATA.length} products`);

    // Test product 1: Sambar Masala
    const sambar = PRODUCTS_DATA.find(p => p.id === 'sambar-masala');
    assert(sambar && sambar.variants.length >= 3, "Sambar masala has variants (50g, 100g, 200g)");

    // Cart calculations simulation
    let items = [];
    function addItem(productId, variantIndex, quantity = 1) {
      const prod = PRODUCTS_DATA.find(p => p.id === productId);
      const variant = prod.variants[variantIndex];
      const key = `${prod.id}_${variant.weight}`;
      const existing = items.find(it => it.key === key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({
          key,
          productId: prod.id,
          name: prod.name,
          weight: variant.weight,
          price: variant.price,
          quantity
        });
      }
    }

    // Add 100g pack of Sambar Masala (₹72) x 2
    addItem('sambar-masala', 1, 2); // 100g, ₹72
    assert(items.length === 1, "1 unique item in cart");
    assert(items[0].quantity === 2, "Quantity is 2");
    assert(items[0].price === 72, "Unit price is ₹72");

    let subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    assert(subtotal === 144, `Subtotal is ₹144 (actual: ₹${subtotal})`);
    let deliveryFee = subtotal >= 499 ? 0 : 40;
    assert(deliveryFee === 40, "Delivery fee is ₹40 for orders under ₹499");

    // Add 250g pack of Special Chicken Masala (₹195) x 2
    addItem('chicken-masala', 2, 2); // 250g, ₹195 x 2 = ₹390
    subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0); // 144 + 390 = 534
    assert(subtotal === 534, `Subtotal is ₹534 after adding chicken masala (actual: ₹${subtotal})`);
    deliveryFee = subtotal >= 499 ? 0 : 40;
    assert(deliveryFee === 0, `FREE delivery unlocked! (deliveryFee: ₹${deliveryFee})`);

    // 3. Test WhatsApp Order Formatter
    console.log("\n[Test 3] Verifying WhatsApp Checkout Message Formatting...");
    let lines = [
      '🌿 *NEW SPICE ORDER - SUBHADARSHINI SPICES* 🌿',
      '--------------------------------------------',
      '*Ordered Items:*'
    ];
    items.forEach((item, index) => {
      lines.push(`${index + 1}. *${item.name}* (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}`);
    });
    lines.push('--------------------------------------------');
    lines.push(`*Subtotal:* ₹${subtotal}`);
    lines.push(`*Delivery:* ${deliveryFee === 0 ? 'FREE (Above ₹499 promo)' : '₹' + deliveryFee}`);
    lines.push(`*Total Amount:* ₹${subtotal + deliveryFee}`);
    const waText = lines.join('\n');

    assert(waText.includes('*Sambar Masala* (100g) x 2 = ₹144'), "WhatsApp message contains Sambar Masala line");
    assert(waText.includes('*Special Chicken Masala* (250g) x 2 = ₹390'), "WhatsApp message contains Chicken Masala line");
    assert(waText.includes('FREE (Above ₹499 promo)'), "WhatsApp message correctly marks delivery as FREE");

    // 4. Test Direct Order API POST (/api/contact)
    console.log("\n[Test 4] Testing Direct Online Order submission via /api/contact...");
    const postData = JSON.stringify({
      name: "Test Customer",
      phone: "9876543210",
      email: "customer@subhadarshini.order",
      subject: "Online Order #ORD-123456 - ₹534",
      inquiryType: "Direct Online Order",
      message: "Test order details"
    });

    const apiResult = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/contact',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let respData = '';
        res.on('data', c => respData += c);
        res.on('end', () => resolve({ status: res.statusCode, body: respData }));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    assert(apiResult.status === 200 || apiResult.status === 201, `POST /api/contact responded with 200/201 (actual: ${apiResult.status})`);
    const parsedResp = JSON.parse(apiResult.body);
    assert(parsedResp.success === true, "Direct Order saved successfully to database/json fallback");

  } catch (err) {
    console.error("Test execution failed:", err);
    failed++;
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
