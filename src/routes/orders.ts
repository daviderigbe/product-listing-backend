import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Product from '../models/Product';
import mongoose from 'mongoose';

const router = Router();

function isPositiveInteger(n: any) {
  return Number.isInteger(n) && n > 0;
}

// Create order
router.post('/', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { items } = req.body; // items: [{ product: id, quantity }]
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // Validate items shape and product ids
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || !it.product) {
        return res.status(400).json({ message: `Item missing 'product' field` });
      }
      if (typeof it.product !== 'string' || !mongoose.Types.ObjectId.isValid(it.product)) {
        return res.status(400).json({ message: `Item has invalid product id: ${it.product}` });
      }
      if (it.quantity !== undefined && !isPositiveInteger(it.quantity)) {
        return res.status(400).json({ message: `Item has invalid quantity: ${it.quantity}` });
      }
    }

    // populate price and validate product existence
    const detailed = await Promise.all(
      items.map(async (it: any) => {
        const product = await Product.findById(it.product);
        if (!product) {
          // return a 404 for a missing product
          const err: any = new Error(`Product not found: ${it.product}`);
          err.status = 404;
          throw err;
        }
        return { product: product._id, quantity: it.quantity || 1, price: product.price };
      })
    );

    const total = detailed.reduce((s: number, it: any) => s + it.price * it.quantity, 0);
    const order = new Order({ user: userId, items: detailed, total });
    await order.save();
    return res.status(201).json(order);
  } catch (err: any) {
    // If we set err.status above, forward to centralized error handler
    if (err && err.status) return next(err);
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user: userId }).populate('items.product');
    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
