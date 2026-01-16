import { Router, Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

const router = Router();

function validateUsername(username: any) {
  if (typeof username !== 'string') return 'username must be a string';
  const u = username.trim();
  if (u.length < 3 || u.length > 30) return 'username must be between 3 and 30 characters';
  if (!/^[A-Za-z0-9._-]+$/.test(u)) return 'username may only contain letters, numbers, dot, underscore and hyphen';
  return null;
}

function validatePassword(password: any) {
  if (typeof password !== 'string') return 'password must be a string';
  if (password.length < 8) return 'password must be at least 8 characters';
  if (password.length > 128) return 'password must be at most 128 characters';
  // require at least one uppercase, one lowercase, one number, and one special character
  if (!/[A-Z]/.test(password)) return 'password must include at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'password must include at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'password must include at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'password must include at least one special character';
  return null;
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });

    const usernameError = validateUsername(username);
    if (usernameError) return res.status(400).json({ message: usernameError });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: 'username already exists' });

    const user = new User({ username, password });
    await user.save();
    return res.status(201).json({ id: user._id, username: user.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
