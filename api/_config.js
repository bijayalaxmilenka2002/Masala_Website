const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// On Vercel serverless, /tmp is writable; locally, use data/
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

// Secret for signing authentication tokens
const AUTH_SECRET = process.env.AUTH_SECRET || 'subhadarshini-spices-secure-hmac-key-2026';

// Ensure directory and files
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
} catch (e) {
  console.warn('Filesystem init warning:', e.message);
}

function getOwnerCredentials() {
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

function saveOwnerCredentials(username, password) {
  const config = {
    username: String(username).trim(),
    password: String(password).trim(),
    updatedAt: new Date().toISOString()
  };
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {}
  return config;
}

function generateAuthToken(username) {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days validity
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
  // 1. Check Cookie
  const cookies = parseCookies(req);
  const token = cookies['subha_auth_token'];
  if (token && verifyAuthToken(token)) return true;

  // 2. Check Authorization Header: Bearer <token>
  const authHeader = req.headers && (req.headers['authorization'] || req.headers['Authorization']);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (bearer && verifyAuthToken(bearer)) return true;
  }
  return false;
}

function getInquiries() {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const data = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}
  return [];
}

function saveInquiries(inquiries) {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf8');
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
