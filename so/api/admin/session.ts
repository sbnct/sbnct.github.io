import {
  ApiRequestLike,
  ApiResponseLike,
  extractToken,
  handleCors,
  verifyAdminToken,
} from '../_admin.js';

export default async function handler(req: ApiRequestLike, res: ApiResponseLike) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const valid = verifyAdminToken(extractToken(req));
  res.status(200).json({ authenticated: valid });
}
