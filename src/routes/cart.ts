import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import mongoose from 'mongoose';

const router = Router();

function isPositiveInteger(n: any) {
  return Number.isInteger(n) && n > 0;
}

// GET /api/cart - get current user's cart
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).populate('cart.product');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ cart: user.cart || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/cart - add an item to cart { product, quantity }
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { product, quantity = 1 } = req.body as { product?: string; quantity?: number };
    if (!product || typeof product !== 'string' || !mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    if (!isPositiveInteger(quantity)) return res.status(400).json({ message: 'Quantity must be a positive integer' });

    const prod = await Product.findById(product);
    if (!prod) return res.status(404).json({ message: 'Product not found' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // find existing item
    const existing = (user.cart || []).find((c: any) => String(c.product) === String(product));
    if (existing) {
      existing.quantity = existing.quantity + quantity;
    } else {
      user.cart = user.cart || [];
      user.cart.push({ product: prod._id, quantity });
    }

    await user.save();
    const populated = await User.findById(req.userId).populate('cart.product');
    return res.status(200).json({ cart: populated?.cart || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/cart - update an item's quantity { product, quantity }
router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { product, quantity } = req.body as { product?: string; quantity?: number };
    if (!product || typeof product !== 'string' || !mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    if (!isPositiveInteger(quantity)) return res.status(400).json({ message: 'Quantity must be a positive integer' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const item = (user.cart || []).find((c: any) => String(c.product) === String(product));
    if (!item) return res.status(404).json({ message: 'Product not found in cart' });

    // assign quantity safely (quantity validated above)
    item.quantity = quantity as number;
    await user.save();
    const populated = await User.findById(req.userId).populate('cart.product');
    return res.json({ cart: populated?.cart || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/cart/:productId - remove a product from cart
router.delete('/:productId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params as any;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'Invalid product id' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.cart = (user.cart || []).filter((c: any) => String(c.product) !== String(productId));
    await user.save();
    const populated = await User.findById(req.userId).populate('cart.product');
    return res.json({ cart: populated?.cart || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/cart/checkout - create order from current cart
router.post('/checkout', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).populate('cart.product');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const cart = user.cart || [];
    if (cart.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // Build detailed line items and validate
    const detailed: any[] = [];
    for (let i = 0; i < cart.length; i++) {
      const it = cart[i];
      if (!it.product) return res.status(400).json({ message: `Cart item at index ${i} has invalid product` });
      const prod = await Product.findById(it.product);
      if (!prod) return res.status(404).json({ message: `Product not found: ${it.product}` });
      const qty = it.quantity || 1;
      detailed.push({ product: prod._id, quantity: qty, price: prod.price });
    }

    const total = detailed.reduce((s, it) => s + it.price * it.quantity, 0);
    const order = new Order({ user: user._id, items: detailed, total });
    await order.save();

    // clear user's cart
    user.cart = [];
    await user.save();

    return res.status(201).json(order);
  } catch (err: any) {
    if (err && err.status) return next(err);
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
