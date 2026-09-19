const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// Cloud sync endpoints for serverless persistence across Vercel lambdas
const INQ_CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0b90b6c2b455a';
const CREDS_CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0b90bb8f9455b';
const AUTH_SECRET = process.env.AUTH_SECRET || 'subhadarshini-spices-secure-hmac-key-2026';

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
  if (token && verifyAuthToken(token)) return true;

  const authHeader = req.headers && (req.headers['authorization'] || req.headers['Authorization']);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (bearer && verifyAuthToken(bearer)) return true;
  }
  return false;
}

async function getInquiries() {
  // 1. Try cloud store first (synced across all serverless instances)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(INQ_CLOUD_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.inquiries)) {
        return json.data.inquiries;
      }
    }
  } catch (e) {}

  // 2. Fallback to local file
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const data = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}

  return [];
}

async function saveInquiries(inquiries) {
  // 1. Save to local fallback file
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf8');
  } catch (e) {}

  // 2. Sync to cloud store
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    await fetch(INQ_CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'subhadarshini_spices_live_inquiries',
        data: { inquiries: inquiries }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
  } catch (e) {}
}

module.exports = {
  getOwnerCredentials,
  saveOwnerCredentials,
  generateAuthToken,
  verifyAuthToken,
  isOwnerAuthenticated,
  getInquiries,
  saveInquiries
};
