const { isOwnerAuthenticated, supabaseService } = require('./_config');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Strict Server-Side Authentication: Only the owner can view, update or delete inquiries
  if (!isOwnerAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: Owner authentication required to access customer inquiries.'
    });
  }

  // GET: Fetch all inquiries or check backend health
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const action = url.searchParams.get('action');

      if (action === 'health') {
        const health = await supabaseService.checkSupabaseHealth();
        return res.status(200).json({ success: true, health });
      }

      const result = await supabaseService.fetchInquiries();
      return res.status(200).json({
        success: true,
        count: result.inquiries.length,
        source: result.source,
        inquiries: result.inquiries
      });
    } catch (err) {
      console.error('[INQUIRIES GET ERROR]:', err);
      return res.status(500).json({ success: false, error: 'Could not fetch inquiries from backend.' });
    }
  }

  // PATCH: Update inquiry status or owner notes
  if (req.method === 'PATCH') {
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      const { id, status, notes } = body || {};

      if (!id) {
        return res.status(400).json({ success: false, error: 'Inquiry ID is required for update.' });
      }

      const updates = {};
      if (status !== undefined) updates.status = String(status).trim();
      if (notes !== undefined) updates.notes = String(notes).trim();

      const updateResult = await supabaseService.updateInquiry(id, updates);

      return res.status(200).json({
        success: true,
        message: `Inquiry #${id} updated successfully.`,
        storage: updateResult.storage
      });
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

      await supabaseService.deleteInquiry(id);

      return res.status(200).json({
        success: true,
        message: `Inquiry #${id} safely archived as Deleted in Supabase database.`
      });
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Failed to delete inquiry.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
};
