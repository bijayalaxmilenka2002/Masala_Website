const crypto = require('crypto');
const { getOwnerCredentials, activeSessions } = require('../_config');

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

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { username, password } = body || {};
    const creds = getOwnerCredentials();

    if (username === creds.username && password === creds.password) {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      activeSessions.add(sessionToken);

      const cookieHeader = `subha_auth_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
      res.setHeader('Set-Cookie', cookieHeader);

      return res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        username: creds.username,
        token: sessionToken
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid Owner Username or Password.'
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid login payload.' });
  }
};
