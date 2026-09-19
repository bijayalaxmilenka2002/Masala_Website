const { getInquiries, saveInquiries } = require('./_config');

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

    const { name, phone, email, subject, inquiryType, message } = body || {};

    if (!name || !phone || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, phone, email, and message are required.'
      });
    }

    const inquiryId = 'SUB-' + Date.now().toString().slice(-6);
    const newEntry = {
      id: inquiryId,
      receivedAt: new Date().toISOString(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      inquiryType: String(inquiryType || 'General Inquiry').trim(),
      subject: String(subject || 'Product Inquiry').trim(),
      message: String(message).trim(),
      status: 'New'
    };

    const inquiries = await getInquiries();
    inquiries.unshift(newEntry);
    await saveInquiries(inquiries);

    console.log(`[INQUIRY RECEIVED] #${inquiryId} from ${newEntry.name}`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry received successfully. Our team will contact you within 24 business hours.',
      inquiryId: inquiryId,
      timestamp: newEntry.receivedAt
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload.' });
  }
};
