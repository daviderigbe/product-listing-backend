import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import { requireAuth, AuthRequest } from '../middleware/auth';
const mongoose = require('mongoose');

const router = Router();

// GET /api/products - list with filters & pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, category, minPrice, maxPrice, page = '1', limit = '12' } = req.query as any;

    const filter: any = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    const pageNum = Math.max(1, Number(page) || 1);
    const lim = Math.max(1, Math.min(100, Number(limit) || 12));

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .sort({ createdAt: -1 });

    return res.json({ total, page: pageNum, limit: lim, products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create product - protected
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, imageUrl } = (req as any).body;
    if (!name || price == null) return res.status(400).json({ message: 'name and price required' });
    const product = new Product({ name, description, price, category, imageUrl });
    await product.save();
    return res.status(201).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = (req as any).params;
    const update = (req as any).body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!product) return res.status(404).json({ message: 'Not found' });
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = (req as any).params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
