const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// Cloud sync endpoints for serverless persistence across Vercel lambdas
const INQ_INDEX_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0b952966745c0';
const CREDS_CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0b90bb8f9455b';
const AUTH_SECRET = process.env.AUTH_SECRET || 'subhadarshini-spices-secure-hmac-key-2026';

// Active sessions memory set (fallback)
const activeSessions = new Set();

// Ensure local fallback files exist
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(INQUIRIES_FILE)) fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), 'utf8');
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
      username: process.env.OWNER_USER || 'admin',
      password: process.env.OWNER_PASS || 'Subhadarshini@2026',
      updatedAt: new Date().toISOString()
    }, null, 2), 'utf8');
  }
} catch (e) {}

async function getOwnerCredentials() {
  // 1. Try cloud credentials
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(CREDS_CLOUD_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.username && json.data.password) {
        return { username: String(json.data.username).trim(), password: String(json.data.password).trim() };
      }
    }
  } catch (e) {}

  // 2. Fallback to local file or env
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (data.username && data.password) {
        return { username: String(data.username).trim(), password: String(data.password).trim() };
      }
    }
  } catch (e) {}

  return { username: process.env.OWNER_USER || 'admin', password: process.env.OWNER_PASS || 'Subhadarshini@2026' };
}

async function saveOwnerCredentials(username, password) {
  const config = {
    username: String(username).trim(),
    password: String(password).trim(),
    updatedAt: new Date().toISOString()
  };

  // 1. Save to local fallback
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {}

  // 2. Save to cloud store
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(CREDS_CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'subhadarshini_spices_owner_creds',
        data: config
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
  } catch (e) {}

  return config;
}

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

function isOwnerAuthenticated(req) {
  const cookies = parseCookies(req);
  const token = cookies['subha_auth_token'];
  if (token && (activeSessions.has(token) || verifyAuthToken(token))) return true;

  const authHeader = req.headers && (req.headers['authorization'] || req.headers['Authorization']);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (bearer && (activeSessions.has(bearer) || verifyAuthToken(bearer))) return true;
  }
  return false;
}

async function getInquiries() {
  const resultsMap = new Map();

  // 1. Read local / tmp file entries
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const localData = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
      if (Array.isArray(localData)) {
        for (const item of localData) {
          if (item && item.id) resultsMap.set(item.id, item);
        }
      }
    }
  } catch (e) {}

  // 1b. Fallback to bundled data/inquiries.json if resultsMap is empty
  if (resultsMap.size === 0) {
    try {
      const bundledPath = path.join(__dirname, '..', 'data', 'inquiries.json');
      if (fs.existsSync(bundledPath)) {
        const bundledData = JSON.parse(fs.readFileSync(bundledPath, 'utf8'));
        if (Array.isArray(bundledData)) {
          for (const item of bundledData) {
            if (item && item.id) resultsMap.set(item.id, item);
          }
        }
      }
    } catch (e) {}
  }

  // 2. Fetch cloud inquiries via index
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const indexRes = await fetch(INQ_INDEX_URL, {
      headers: { 'User-Agent': 'SubhadarshiniSpices/2.0' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (indexRes.ok) {
      const indexJson = await indexRes.json();
      const idsStr = indexJson && indexJson.data && indexJson.data.ids;
      if (idsStr && typeof idsStr === 'string') {
        const ids = idsStr.split(',').map(s => s.trim()).filter(Boolean);
        if (ids.length > 0) {
          const queryParams = ids.slice(0, 30).map(id => 'id=' + encodeURIComponent(id)).join('&');
          const fetchController = new AbortController();
          const fetchTimeout = setTimeout(() => fetchController.abort(), 4000);
          const multiRes = await fetch('https://api.restful-api.dev/objects?' + queryParams, {
            signal: fetchController.signal
          });
          clearTimeout(fetchTimeout);

          if (multiRes.ok) {
            const multiJson = await multiRes.json();
            if (Array.isArray(multiJson)) {
              for (const obj of multiJson) {
                if (obj && obj.data && obj.data.id) {
                  resultsMap.set(obj.data.id, obj.data);
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {}

  // Convert map to array and sort latest first
  const list = Array.from(resultsMap.values());
  list.sort((a, b) => {
    const ta = new Date(a.receivedAt || 0).getTime();
    const tb = new Date(b.receivedAt || 0).getTime();
    return tb - ta;
  });

  // Sync back to local file if on local or warm lambda
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {}

  return list;
}

async function saveInquiries(inquiries) {
  // 1. Save to local fallback file immediately
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf8');
  } catch (e) {}

  // 2. Cloud sync latest entry
  if (Array.isArray(inquiries) && inquiries.length > 0) {
    const latest = inquiries[0];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      // Create single object for this inquiry
      const createRes = await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SubhadarshiniSpices/2.0'
        },
        body: JSON.stringify({
          name: 'subha_inq_' + latest.id,
          data: latest
        }),
        signal: controller.signal
      });

      if (createRes.ok) {
        const createdObj = await createRes.json();
        const newCloudId = createdObj.id;

        // Fetch current index to prepend new ID
        const indexRes = await fetch(INQ_INDEX_URL, { signal: controller.signal });
        if (indexRes.ok) {
          const indexJson = await indexRes.json();
          const currentIds = (indexJson && indexJson.data && indexJson.data.ids) || '';
          const existingList = currentIds.split(',').map(s => s.trim()).filter(Boolean);
          const updatedList = [newCloudId, ...existingList.filter(id => id !== newCloudId)].slice(0, 30);

          await fetch(INQ_INDEX_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'subhadarshini_inquiry_index',
              data: { ids: updatedList.join(',') }
            }),
            signal: controller.signal
          });
        }
      }
      clearTimeout(timeout);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  return { ok: true };
}

module.exports = {
  activeSessions,
  getOwnerCredentials,
  saveOwnerCredentials,
  generateAuthToken,
  verifyAuthToken,
  isOwnerAuthenticated,
  getInquiries,
  saveInquiries
};
