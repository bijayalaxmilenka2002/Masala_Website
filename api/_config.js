const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseService = require('./_supabase');

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

const AUTH_SECRET = process.env.AUTH_SECRET || 'subhadarshini-spices-secure-hmac-key-2026';

// Active in-memory session tokens
const activeSessions = new Set();

// Ensure local config file exists
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
      username: process.env.OWNER_USER || 'admin',
      password: process.env.OWNER_PASS || 'Subhadarshini@2026',
      updatedAt: new Date().toISOString()
    }, null, 2), 'utf8');
  }
} catch (e) {}

async function getOwnerCredentials() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (data && data.username && data.password) {
        return { 
          username: String(data.username).trim(), 
          password: String(data.password).trim() 
        };
      }
    }
  } catch (e) {}

  return {
    username: process.env.OWNER_USER || 'admin',
    password: process.env.OWNER_PASS || 'Subhadarshini@2026'
  };
}

async function saveOwnerCredentials(username, password) {
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

// Proxies to Supabase Service
async function getInquiries() {
  const result = await supabaseService.fetchInquiries();
  return result.inquiries || [];
}

async function saveInquiries(inquiries) {
  // If an array is passed, write first entry or bulk
  if (Array.isArray(inquiries) && inquiries.length > 0) {
    return await supabaseService.saveInquiry(inquiries[0]);
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
  saveInquiries,
  supabaseService
};
