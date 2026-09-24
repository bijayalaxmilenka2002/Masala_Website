/**
 * Subhadarshini Spices - Supabase Integration Module
 * Handles cloud database persistence for contact form inquiries and owner portal.
 * Includes automatic local fallback if Supabase credentials are not yet configured.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let createClient = null;
try {
  const supabaseModule = require('@supabase/supabase-js');
  createClient = supabaseModule.createClient;
} catch (e) {
  // Graceful fallback if module isn't loaded in some serverless contexts
}

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
// Prefer service role key for backend operations; fallback to anon key
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const LOCAL_INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

// Ensure local fallback file exists
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LOCAL_INQUIRIES_FILE)) {
    fs.writeFileSync(LOCAL_INQUIRIES_FILE, JSON.stringify([], null, 2), 'utf8');
  }
} catch (e) {}

let supabaseInstance = null;

function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL && 
    SUPABASE_URL.startsWith('http') && 
    SUPABASE_KEY && 
    SUPABASE_KEY.length > 20 &&
    !SUPABASE_URL.includes('your-project-id')
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseInstance && createClient) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false }
      });
    } catch (err) {
      console.error('[SUPABASE INIT ERROR]:', err.message);
      return null;
    }
  }
  return supabaseInstance;
}

// Read local JSON database fallback
function getLocalInquiries() {
  try {
    if (fs.existsSync(LOCAL_INQUIRIES_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_INQUIRIES_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}
  return [];
}

// Write to local JSON database fallback
function saveLocalInquiries(list) {
  try {
    fs.writeFileSync(LOCAL_INQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Save new customer inquiry to Supabase
 */
async function saveInquiry(entry) {
  const localList = getLocalInquiries();
  // Keep local backup
  const filteredLocal = localList.filter(item => item && item.id !== entry.id);
  filteredLocal.unshift(entry);
  saveLocalInquiries(filteredLocal);

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: true,
      storage: 'local',
      message: 'Saved to local database (Supabase not configured in .env)'
    };
  }

  try {
    const row = {
      id: entry.id,
      name: entry.name,
      phone: entry.phone,
      email: entry.email || '',
      inquiry_type: entry.inquiryType || entry.inquiry_type || 'General Inquiry',
      subject: entry.subject || 'Product Inquiry',
      message: entry.message,
      status: entry.status || 'New',
      notes: entry.notes || '',
      created_at: entry.receivedAt || new Date().toISOString(),
      received_at: entry.receivedAt || new Date().toISOString(),
      source: 'Website Contact Form'
    };

    const { data, error } = await client
      .from('inquiries')
      .upsert(row, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('[SUPABASE INSERT WARNING]:', error.message);
      return {
        success: true,
        storage: 'local_fallback',
        error: error.message,
        message: 'Saved to local file; Supabase returned error: ' + error.message
      };
    }

    return {
      success: true,
      storage: 'supabase',
      data: data
    };
  } catch (err) {
    console.error('[SUPABASE SAVE EXCEPTION]:', err.message);
    return {
      success: true,
      storage: 'local_fallback',
      error: err.message
    };
  }
}

/**
 * Fetch all inquiries for the Owner Portal
 */
async function fetchInquiries() {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Map Supabase snake_case fields to camelCase for the owner portal
        const mapped = data.map(item => ({
          id: item.id,
          receivedAt: item.received_at || item.created_at,
          name: item.name,
          phone: item.phone,
          email: item.email,
          inquiryType: item.inquiry_type || 'General Inquiry',
          subject: item.subject,
          message: item.message,
          status: item.status || 'New',
          notes: item.notes || '',
          source: item.source || 'Website'
        }));

        // Mirror to local cache for instant offline responsiveness
        saveLocalInquiries(mapped);

        return {
          source: 'supabase',
          inquiries: mapped
        };
      } else if (error) {
        console.warn('[SUPABASE FETCH WARNING]:', error.message);
      }
    } catch (err) {
      console.error('[SUPABASE FETCH EXCEPTION]:', err.message);
    }
  }

  // Fallback to local storage
  const localList = getLocalInquiries();
  localList.sort((a, b) => new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime());

  return {
    source: isSupabaseConfigured() ? 'local_fallback' : 'local',
    inquiries: localList
  };
}

/**
 * Update inquiry status or owner notes
 */
async function updateInquiry(id, updates) {
  // Update local file first
  let localList = getLocalInquiries();
  let updatedInLocal = false;
  localList = localList.map(item => {
    if (item.id === id) {
      updatedInLocal = true;
      return { ...item, ...updates };
    }
    return item;
  });
  if (updatedInLocal) saveLocalInquiries(localList);

  const client = getSupabaseClient();
  if (client) {
    try {
      const payload = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.inquiryType !== undefined) payload.inquiry_type = updates.inquiryType;

      const { data, error } = await client
        .from('inquiries')
        .update(payload)
        .eq('id', id)
        .select();

      if (!error) {
        return { success: true, storage: 'supabase', data };
      }
    } catch (e) {
      console.warn('[SUPABASE UPDATE WARNING]:', e.message);
    }
  }

  return {
    success: updatedInLocal,
    storage: 'local'
  };
}

/**
 * Soft Delete an inquiry (Preserves deleted inquiries in Supabase database)
 */
async function deleteInquiry(id) {
  const deletedTimestamp = new Date().toISOString();

  // 1. Soft-delete in local backup (keep record marked as Deleted)
  let localList = getLocalInquiries();
  localList = localList.map(item => {
    if (item.id === id) {
      const existingNotes = item.notes || '';
      const deleteNote = `[Archived / Deleted on ${new Date().toLocaleDateString('en-IN')}]`;
      return {
        ...item,
        status: 'Deleted',
        deletedAt: deletedTimestamp,
        notes: existingNotes ? `${existingNotes} ${deleteNote}` : deleteNote
      };
    }
    return item;
  });
  saveLocalInquiries(localList);

  // 2. Soft-delete in Supabase: persist the deleted record in Supabase with status = 'Deleted'
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('inquiries')
        .update({
          status: 'Deleted'
        })
        .eq('id', id)
        .select();

      if (error) {
        console.warn('[SUPABASE SOFT-DELETE WARNING]:', error.message);
      }
    } catch (e) {
      console.warn('[SUPABASE SOFT-DELETE EXCEPTION]:', e.message);
    }
  }

  return { success: true, message: 'Inquiry safely archived as Deleted in Supabase database.' };
}

/**
 * Health check connection to Supabase
 */
async function checkSupabaseHealth() {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      message: 'Supabase URL or Key not set in .env. Running on local database backup.',
      storage: 'local'
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      configured: false,
      message: 'Failed to initialize Supabase client.',
      storage: 'local'
    };
  }

  try {
    const { count, error } = await client
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        configured: true,
        connected: false,
        error: error.message,
        message: 'Could not connect to table "inquiries": ' + error.message,
        storage: 'local_fallback'
      };
    }

    return {
      configured: true,
      connected: true,
      tableCount: count || 0,
      url: SUPABASE_URL.replace(/https:\/\/(.*?)\..*/, '$1.supabase.co'),
      storage: 'supabase',
      message: 'Supabase cloud database is connected and active.'
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      error: err.message,
      storage: 'local_fallback'
    };
  }
}

module.exports = {
  isSupabaseConfigured,
  getSupabaseClient,
  saveInquiry,
  fetchInquiries,
  updateInquiry,
  deleteInquiry,
  checkSupabaseHealth
};
