"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
function isPositiveInteger(n) {
    return Number.isInteger(n) && n > 0;
}
// Create order (checkout) - requires auth
router.post('/', auth_1.requireAuth, async (req, res, next) => {
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
            if (typeof it.product !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(it.product)) {
                return res.status(400).json({ message: `Item has invalid product id: ${it.product}` });
            }
            if (it.quantity !== undefined && !isPositiveInteger(it.quantity)) {
                return res.status(400).json({ message: `Item has invalid quantity: ${it.quantity}` });
            }
        }
        // populate price and validate product existence
        const detailed = await Promise.all(items.map(async (it) => {
            const product = await Product_1.default.findById(it.product);
            if (!product) {
                // return a 404 for a missing product
                const err = new Error(`Product not found: ${it.product}`);
                err.status = 404;
                throw err;
            }
            return { product: product._id, quantity: it.quantity || 1, price: product.price };
        }));
        const total = detailed.reduce((s, it) => s + it.price * it.quantity, 0);
        const order = new Order_1.default({ user: userId, items: detailed, total });
        await order.save();
        return res.status(201).json(order);
    }
    catch (err) {
        // If we set err.status above, forward to centralized error handler
        if (err && err.status)
            return next(err);
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order_1.default.find({ user: userId }).populate('items.product');
        return res.json(orders);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
