/**
 * Subhadarshini Spices - Dedicated Live Web & API Server
 * Built with native Node.js and integrated with Supabase Cloud Database.
 *
 * Features:
 * - High-speed static asset serving with clean URLs (/about, /products, etc.)
 * - Live Contact Form Receiving API (`POST /api/contact`) saved directly to Supabase
 * - Persistent Owner Credentials (`data/admin-config.json` & env)
 * - Protected Owner Portal API (`/api/inquiries`, `/api/owner/*`)
 * - STRICT SERVER-SIDE OWNER AUTHENTICATION:
 *   - Only authenticated owners can access `/inquiries.html` or `/api/inquiries`
 *   - Unauthenticated visitors are blocked and redirected to `/owner-login.html`
 *   - Stateless HMAC token authentication survives server restarts
 * - Supabase Cloud Database with seamless local JSON fallback
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Load environment variables from .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseService = require('./api/_supabase');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// In-Memory Active Sessions (plus HMAC verification)
const activeSessions = new Set();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    username: process.env.OWNER_USER || 'admin',
    password: process.env.OWNER_PASS || 'Subhadarshini@2026',
    updatedAt: new Date().toISOString()
  }, null, 2), 'utf8');
}

function getOwnerCredentials() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (data && data.username && data.password) {
        return { username: String(data.username).trim(), password: String(data.password).trim() };
      }
    }
  } catch (e) {
    console.warn('Could not read admin-config.json, using defaults:', e);
  }
  return { 
    username: process.env.OWNER_USER || 'admin', 
    password: process.env.OWNER_PASS || 'Subhadarshini@2026' 
  };
}

function saveOwnerCredentials(username, password) {
  const config = {
    username: String(username).trim(),
    password: String(password).trim(),
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  return config;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function parseCookies(req) {
  const list = {};
  const rc = req.headers && req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
}

const AUTH_SECRET = process.env.AUTH_SECRET || 'subhadarshini-spices-secure-hmac-key-2026';

function generateAuthToken(username) {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + 14 * 24 * 60 * 60 * 1000
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(b64).digest('base64url');
  return `${b64}.${signature}`;
}

function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [b64, signature] = parts;
  try {
    const expected = crypto.createHmac('sha256', AUTH_SECRET).update(b64).digest('base64url');
    if (signature !== expected) return false;
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (payload && payload.exp && payload.exp > Date.now()) {
      return payload;
    }
  } catch (e) {}
  return false;
}

function isOwnerAuthenticated(req) {
  const cookies = parseCookies(req);
  const tokenFromCookie = cookies['subha_auth_token'];
  if (tokenFromCookie && (activeSessions.has(tokenFromCookie) || verifyAuthToken(tokenFromCookie))) {
    return true;
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    if (activeSessions.has(bearerToken) || verifyAuthToken(bearerToken)) {
      return true;
    }
  }

  return false;
}

function sendJSON(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...headers
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // --- API ROUTE: Owner Login (POST /api/owner/login) ---
  if (pathname === '/api/owner/login' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { username, password } = JSON.parse(raw);
      const currentCreds = getOwnerCredentials();

      if (username === currentCreds.username && password === currentCreds.password) {
        const sessionToken = generateAuthToken(currentCreds.username);
        activeSessions.add(sessionToken);

        console.log(`[AUTH SUCCESS] Owner logged in as: ${username}`);

        const cookieHeader = `subha_auth_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${14 * 24 * 60 * 60}`;
        return sendJSON(res, 200, {
          success: true,
          message: 'Authentication successful.',
          username: currentCreds.username,
          token: sessionToken
        }, { 'Set-Cookie': cookieHeader });
      } else {
        console.warn(`[AUTH FAILED] Failed login attempt for: "${username}"`);
        return sendJSON(res, 401, {
          success: false,
          error: 'Invalid Owner Username or Password.'
        });
      }
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: 'Invalid login payload.' });
    }
  }

  // --- API ROUTE: Change Credentials (POST /api/owner/change-credentials) - PROTECTED ---
  if (pathname === '/api/owner/change-credentials' && req.method === 'POST') {
    if (!isOwnerAuthenticated(req)) {
      return sendJSON(res, 401, { success: false, error: 'Access Denied: Owner login required.' });
    }

    try {
      const raw = await readBody(req);
      const { currentPassword, newUsername, newPassword } = JSON.parse(raw);
      const currentCreds = getOwnerCredentials();

      if (currentPassword !== currentCreds.password) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Current password is incorrect. Verification failed.'
        });
      }

      if (!newUsername || String(newUsername).trim().length < 3) {
        return sendJSON(res, 400, {
          success: false,
          error: 'New username must be at least 3 characters long.'
        });
      }

      if (!newPassword || String(newPassword).trim().length < 6) {
        return sendJSON(res, 400, {
          success: false,
          error: 'New password must be at least 6 characters long.'
        });
      }

      saveOwnerCredentials(newUsername, newPassword);
      console.log(`[CREDENTIALS UPDATED] Owner username updated to: "${newUsername}"`);

      return sendJSON(res, 200, {
        success: true,
        message: `Username and password successfully updated! Next login will require username "${newUsername}".`
      });
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: 'Invalid request body.' });
    }
  }

  // --- API ROUTE: Owner Logout (POST /api/owner/logout) ---
  if (pathname === '/api/owner/logout' && req.method === 'POST') {
    const cookies = parseCookies(req);
    const token = cookies['subha_auth_token'];
    if (token) {
      activeSessions.delete(token);
    }
    const expireCookie = `subha_auth_token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    return sendJSON(res, 200, { success: true, message: 'Logged out.' }, { 'Set-Cookie': expireCookie });
  }

  // --- API ROUTE: Receive Contact Inquiry (POST /api/contact) - Public ---
  if (pathname === '/api/contact' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw);
      const { name, phone, email, subject, inquiryType, type, message } = data;

      if (!name || !phone || !email || !message) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Missing required fields: Name, Phone, Email, and Message are required.'
        });
      }

      const cleanName = String(name).trim();
      const cleanPhone = String(phone).trim();
      const cleanEmail = String(email).trim();
      const cleanMessage = String(message).trim();

      const digitsOnly = cleanPhone.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        return sendJSON(res, 400, {
          success: false,
          error: 'Please enter a valid 10-digit mobile number.'
        });
      }

      const inquiryId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
      const newEntry = {
        id: inquiryId,
        receivedAt: new Date().toISOString(),
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        inquiryType: String(inquiryType || type || 'General Inquiry').trim(),
        subject: String(subject || 'Product Inquiry').trim(),
        message: cleanMessage,
        status: 'New',
        notes: ''
      };

      // Save into Supabase backend
      const result = await supabaseService.saveInquiry(newEntry);

      console.log(`[INQUIRY SAVED TO ${result.storage?.toUpperCase() || 'BACKEND'}] #${inquiryId} from ${newEntry.name} (${newEntry.phone})`);

      return sendJSON(res, 201, {
        success: true,
        message: 'Thank you! Your inquiry has been safely received. Our sales team will get in touch with you shortly.',
        inquiryId: inquiryId,
        timestamp: newEntry.receivedAt,
        storage: result.storage
      });
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: 'Invalid JSON payload format.' });
    }
  }

  // --- API ROUTE: Inquiries API (GET, PATCH, DELETE) - PROTECTED ---
  if (pathname === '/api/inquiries') {
    if (!isOwnerAuthenticated(req)) {
      return sendJSON(res, 401, {
        success: false,
        error: 'Access Denied: Owner login required to view customer inquiries.'
      });
    }

    // Health check endpoint for Supabase connection
    if (req.method === 'GET' && parsedUrl.query.action === 'health') {
      const health = await supabaseService.checkSupabaseHealth();
      return sendJSON(res, 200, { success: true, health });
    }

    // GET: Fetch all inquiries
    if (req.method === 'GET') {
      try {
        const result = await supabaseService.fetchInquiries();
        return sendJSON(res, 200, {
          success: true,
          count: result.inquiries.length,
          source: result.source,
          inquiries: result.inquiries
        });
      } catch (err) {
        return sendJSON(res, 500, { success: false, error: 'Could not fetch inquiries.' });
      }
    }

    // PATCH: Update status or owner notes
    if (req.method === 'PATCH') {
      try {
        const raw = await readBody(req);
        const { id, status, notes } = JSON.parse(raw);
        if (!id) {
          return sendJSON(res, 400, { success: false, error: 'Inquiry ID is required.' });
        }

        const updates = {};
        if (status !== undefined) updates.status = String(status).trim();
        if (notes !== undefined) updates.notes = String(notes).trim();

        const updateResult = await supabaseService.updateInquiry(id, updates);

        return sendJSON(res, 200, { 
          success: true, 
          message: `Inquiry #${id} updated successfully.`,
          storage: updateResult.storage
        });
      } catch (e) {
        return sendJSON(res, 400, { success: false, error: 'Invalid update payload.' });
      }
    }

    // DELETE: Delete an inquiry
    if (req.method === 'DELETE') {
      try {
        const raw = await readBody(req);
        const { id } = JSON.parse(raw);
        if (!id) {
          return sendJSON(res, 400, { success: false, error: 'Inquiry ID is required to delete.' });
        }

        await supabaseService.deleteInquiry(id);
        return sendJSON(res, 200, { 
          success: true, 
          message: `Inquiry #${id} permanently deleted from database.` 
        });
      } catch (e) {
        return sendJSON(res, 400, { success: false, error: 'Failed to delete inquiry.' });
      }
    }

    return sendJSON(res, 405, { success: false, error: 'Method Not Allowed' });
  }

  // --- STRICT ACCESS CONTROL FOR INQUIRIES PAGE ---
  if (pathname === '/inquiries.html' || pathname === '/inquiries') {
    if (!isOwnerAuthenticated(req)) {
      res.writeHead(302, { 'Location': '/owner-login.html' });
      res.end();
      return;
    }
  }

  // --- STATIC FILE SERVING WITH CLEAN URL RESOLUTION ---
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // Check if direct file exists, or if adding .html resolves it (clean URLs)
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    if (fs.existsSync(filePath + '.html') && fs.statSync(filePath + '.html').isFile()) {
      filePath = filePath + '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found</title><style>body{font-family:sans-serif;text-align:center;padding:5rem;color:#333;}</style></head>
        <body>
          <h1>404 - Page Not Found</h1>
          <p>The requested URL <code>${pathname}</code> does not exist.</p>
          <a href="/" style="color:#D9531E;font-weight:bold;">Return to Home</a>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

const currentCreds = getOwnerCredentials();
server.listen(PORT, () => {
  const isSupaConfigured = supabaseService.isSupabaseConfigured();
  console.log(`====================================================`);
  console.log(`  Subhadarshini Spices Live Server Active`);
  console.log(`  Website:       http://localhost:${PORT}`);
  console.log(`  Owner Portal:  http://localhost:${PORT}/inquiries.html (Protected)`);
  console.log(`  Owner Login:   http://localhost:${PORT}/owner-login.html`);
  console.log(`  Current User:  ${currentCreds.username}`);
  console.log(`  Supabase:      ${isSupaConfigured ? '🟢 Connected to Cloud' : '🟡 Local Mode (Add keys in .env)'}`);
  console.log(`====================================================`);
});
