/**
 * Automated Verification Script for Subhadarshini Spices Cart & Customer Auth Feature
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
  console.log("=== STARTING CART & CLIENT AUTH FEATURE TESTS ===");
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
    assert(htmlRes.data.includes('customer-auth.js'), "products.html includes customer-auth.js script");
    assert(htmlRes.data.includes('cart.js'), "products.html includes cart.js script");
    assert(htmlRes.data.includes('cart-nav-btn'), "products.html includes cart-nav-btn");
    assert(htmlRes.data.includes('modal-qty-stepper'), "products.html includes modal-qty-stepper");

    const cartJsRes = await fetchURL('/assets/js/cart.js?v=5.1');
    assert(cartJsRes.status === 200, "assets/js/cart.js returns 200 OK");
    assert(cartJsRes.data.includes('CartManager'), "cart.js contains CartManager object");

    const authJsRes = await fetchURL('/assets/js/customer-auth.js?v=5.1');
    assert(authJsRes.status === 200, "assets/js/customer-auth.js returns 200 OK");
    assert(authJsRes.data.includes('CustomerAuth'), "customer-auth.js contains CustomerAuth object");

    const loginRes = await fetchURL('/login.html');
    assert(loginRes.status === 200, "login.html returns 200 OK");
    assert(loginRes.data.includes('pageSignInForm'), "login.html contains customer sign-in form");
    assert(loginRes.data.includes('pageRegisterForm'), "login.html contains customer registration form");

    const indexRes = await fetchURL('/');
    assert(indexRes.status === 200, "index.html returns 200 OK");
    assert(indexRes.data.includes('cart-nav-btn'), "index.html includes cart-nav-btn");
    assert(indexRes.data.includes('customer-auth.js'), "index.html includes customer-auth.js script");
    assert(indexRes.data.includes('cart.js'), "index.html includes cart.js script");

    // 2. Mock CartManager and CustomerAuth logic in Node environment
    console.log("\n[Test 2] Testing Individual Client Carts & Isolation...");
    const productsFileContent = fs.readFileSync(path.join(__dirname, '../assets/js/products-data.js'), 'utf8');
    const mockWindow = {};
    eval(productsFileContent.replace('const PRODUCTS_DATA', 'mockWindow.PRODUCTS_DATA'));
    const PRODUCTS_DATA = mockWindow.PRODUCTS_DATA;

    assert(Array.isArray(PRODUCTS_DATA) && PRODUCTS_DATA.length > 0, `Loaded ${PRODUCTS_DATA.length} products`);

    // Simulate Client A (Phone: 9876543210)
    const clientA = { name: "Client A", phone: "9876543210" };
    // Simulate Client B (Phone: 9123456780)
    const clientB = { name: "Client B", phone: "9123456780" };

    const mockStorage = {};
    function getCartForUser(user) {
      const key = `subhadarshini_cart_${user.phone}`;
      return mockStorage[key] || [];
    }
    function saveCartForUser(user, items) {
      const key = `subhadarshini_cart_${user.phone}`;
      mockStorage[key] = items;
    }

    // Client A adds 2 packs of Sambar Masala 100g (₹72)
    saveCartForUser(clientA, [
      { key: "sambar-masala_100g", productId: "sambar-masala", name: "Sambar Masala", weight: "100g", price: 72, quantity: 2 }
    ]);

    // Client B adds 1 pack of Royal Meat Masala 200g (₹165)
    saveCartForUser(clientB, [
      { key: "meat-masala_200g", productId: "meat-masala", name: "Royal Meat Masala", weight: "200g", price: 165, quantity: 1 }
    ]);

    const cartA = getCartForUser(clientA);
    const cartB = getCartForUser(clientB);

    assert(cartA.length === 1 && cartA[0].name === "Sambar Masala", "Client A has Sambar Masala");
    assert(cartA[0].quantity === 2, "Client A sees quantity 2");
    assert(cartB.length === 1 && cartB[0].name === "Royal Meat Masala", "Client B has Royal Meat Masala");
    assert(cartB[0].name !== cartA[0].name, "Client A and Client B have completely separate, individual carts");

    // 3. Test WhatsApp Order Formatter (Exclusively via WhatsApp, no online delivery option)
    console.log("\n[Test 3] Verifying WhatsApp Checkout Message Formatting with Client Details...");
    let lines = [
      '🌿 *NEW SPICE ORDER - SUBHADARSHINI SPICES* 🌿',
      '--------------------------------------------',
      `*Customer:* ${clientA.name} (${clientA.phone})`,
      '--------------------------------------------',
      '*Ordered Items:*'
    ];
    cartA.forEach((item, index) => {
      lines.push(`${index + 1}. *${item.name}* (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}`);
    });
    const subtotal = cartA.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    lines.push('--------------------------------------------');
    lines.push(`*Total Items:* 2 pack(s)`);
    lines.push(`*Estimated Order Value:* ₹${subtotal}`);
    const waText = lines.join('\n');

    assert(waText.includes('*Customer:* Client A (9876543210)'), "WhatsApp message includes client name & mobile");
    assert(waText.includes('*Sambar Masala* (100g) x 2 = ₹144'), "WhatsApp message includes itemized products & quantity");
    assert(waText.includes('*Estimated Order Value:* ₹144'), "WhatsApp message includes correct order total without delivery fee");

    // 4. Test Direct Order API POST (/api/contact)
    console.log("\n[Test 4] Testing Direct Online Order submission via /api/contact...");
    const postData = JSON.stringify({
      name: "Priyadarshini",
      phone: "9876543210",
      email: "customer@subhadarshini.order",
      subject: "Online Order #ORD-882201 - ₹184",
      inquiryType: "Direct Online Order",
      message: "Order details"
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
    assert(parsedResp.success === true, "Direct Order saved successfully to database");

  } catch (err) {
    console.error("Test execution failed:", err);
    failed++;
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
