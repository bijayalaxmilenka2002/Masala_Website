const fs = require('fs');
const path = require('path');

// On Vercel serverless, /tmp is writable; locally, use data/
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

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

// Global active sessions token storage
if (!global._subhaSessions) {
  global._subhaSessions = new Set();
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
  return { username: 'admin', password: 'Subhadarshini@2026' };
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

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
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
  if (token && global._subhaSessions.has(token)) return true;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (global._subhaSessions.has(bearer)) return true;
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
  isOwnerAuthenticated,
  getInquiries,
  saveInquiries,
  activeSessions: global._subhaSessions
};
