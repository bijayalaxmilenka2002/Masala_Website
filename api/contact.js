const { supabaseService } = require('./_config');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { name, phone, email, subject, inquiryType, type, message } = body || {};

    const resolvedType = String(inquiryType || type || 'General Inquiry').trim();
    const isNewsletter = resolvedType.toLowerCase().includes('newsletter');

    const cleanEmail = String(email || '').trim();
    const cleanName = String(name || (isNewsletter ? 'Newsletter Subscriber' : '')).trim();
    const cleanPhone = String(phone || (isNewsletter ? '9999999999' : '')).trim();
    const cleanMessage = String(message || (isNewsletter ? 'Newsletter subscription request.' : '')).trim();
    const cleanSubject = String(subject || (isNewsletter ? 'Newsletter Subscription' : 'Product Inquiry')).trim();

    // Validate inputs
    if (!cleanName || !cleanPhone || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Name, Phone, Email, and Message).'
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter a valid full name.' });
    }

    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (!isNewsletter && digitsOnly.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const inquiryId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
    const newEntry = {
      id: inquiryId,
      receivedAt: new Date().toISOString(),
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      inquiryType: resolvedType,
      subject: cleanSubject,
      message: cleanMessage,
      status: 'New',
      notes: ''
    };

    // Save directly to Supabase cloud database (with local fallback)
    const saveResult = await supabaseService.saveInquiry(newEntry);

    console.log(`[INQUIRY SAVED TO ${saveResult.storage?.toUpperCase() || 'BACKEND'}] #${inquiryId} from ${newEntry.name} (${newEntry.phone})`);

    // Return confirmation to customer with reference code
    return res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been safely received. Our sales team will get in touch with you shortly.',
      inquiryId: inquiryId,
      timestamp: newEntry.receivedAt,
      storage: saveResult.storage
    });

  } catch (err) {
    console.error('[CONTACT API ERROR]:', err);
    return res.status(400).json({ success: false, error: 'Invalid inquiry data format.' });
  }
};
