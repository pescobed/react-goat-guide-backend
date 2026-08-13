import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../utils/authUtils';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  // 1. Check username first
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // 2. Get the hashed password from your .env file
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  // 3. Compare entered password with the hash
  const isMatch = await comparePassword(password, storedHash);

  if (isMatch) {
    // 4. Generate a JWT token using env variable
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const token = jwt.sign(
      { role: 'admin', username }, 
      secret, 
      { expiresIn: '24h' }
    );

    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
};
