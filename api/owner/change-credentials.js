const { isOwnerAuthenticated, getOwnerCredentials, saveOwnerCredentials } = require('../_config');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  if (!isOwnerAuthenticated(req)) {
    return res.status(401).json({ success: false, error: 'Access Denied: Owner login required.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { currentPassword, newUsername, newPassword } = body || {};
    const creds = await getOwnerCredentials();

    if (currentPassword !== creds.password) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    }

    if (!newUsername || String(newUsername).trim().length < 3) {
      return res.status(400).json({ success: false, error: 'New username must be at least 3 characters long.' });
    }

    if (!newPassword || String(newPassword).trim().length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    await saveOwnerCredentials(newUsername, newPassword);

    return res.status(200).json({
      success: true,
      message: `Username and password successfully updated to "${newUsername}".`
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid request payload.' });
  }
};
