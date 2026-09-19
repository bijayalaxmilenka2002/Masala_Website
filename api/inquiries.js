const { isOwnerAuthenticated, getInquiries, saveInquiries } = require('./_config');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!isOwnerAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: Owner login required to view customer inquiries.'
    });
  }

  // GET: Fetch all inquiries
  if (req.method === 'GET') {
    const inquiries = await getInquiries();
    return res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries: inquiries
    });
  }

  // PATCH: Update inquiry status (e.g. 'New' -> 'Contacted' -> 'Resolved')
  if (req.method === 'PATCH') {
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      const { id, status } = body || {};

      if (!id || !status) {
        return res.status(400).json({ success: false, error: 'Inquiry ID and new status are required.' });
      }

      let inquiries = await getInquiries();
      let updated = false;
      inquiries = inquiries.map(item => {
        if (item.id === id) {
          updated = true;
          return { ...item, status: String(status).trim() };
        }
        return item;
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Inquiry not found.' });
      }

      await saveInquiries(inquiries);
      return res.status(200).json({ success: true, message: `Inquiry #${id} status updated to ${status}.`, inquiries });
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid update payload.' });
    }
  }

  // DELETE: Delete an inquiry by ID
  if (req.method === 'DELETE') {
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      const { id } = body || req.query || {};

      if (!id) {
        return res.status(400).json({ success: false, error: 'Inquiry ID is required to delete.' });
      }

      let inquiries = await getInquiries();
      const filtered = inquiries.filter(item => item.id !== id);

      if (filtered.length === inquiries.length) {
        return res.status(404).json({ success: false, error: 'Inquiry not found.' });
      }

      await saveInquiries(filtered);
      return res.status(200).json({ success: true, message: `Inquiry #${id} deleted successfully.`, count: filtered.length });
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Failed to delete inquiry.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
};
