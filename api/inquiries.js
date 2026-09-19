const { isOwnerAuthenticated, getInquiries } = require('./_config');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  if (!isOwnerAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: Owner login required to view customer inquiries.'
    });
  }

  const inquiries = getInquiries();
  return res.status(200).json({
    success: true,
    count: inquiries.length,
    inquiries: inquiries
  });
};
