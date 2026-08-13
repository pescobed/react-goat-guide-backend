import jwt from 'jsonwebtoken';

export const verifyAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header or invalid format');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  console.log('DEBUG: Full Auth Header:', authHeader);
  console.log('DEBUG: Extracted Token:', `"${token}"`);
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
