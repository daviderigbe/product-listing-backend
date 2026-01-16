"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const mongoose = require('mongoose');
const router = (0, express_1.Router)();
// GET /api/products - list with filters & pagination
router.get('/', async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, page = '1', limit = '12' } = req.query;
        const filter = {};
        if (q)
            filter.name = { $regex: q, $options: 'i' };
        if (category)
            filter.category = category;
        if (minPrice || maxPrice)
            filter.price = {};
        if (minPrice)
            filter.price.$gte = Number(minPrice);
        if (maxPrice)
            filter.price.$lte = Number(maxPrice);
        const pageNum = Math.max(1, Number(page) || 1);
        const lim = Math.max(1, Math.min(100, Number(limit) || 12));
        const total = await Product_1.default.countDocuments(filter);
        const products = await Product_1.default.find(filter)
            .skip((pageNum - 1) * lim)
            .limit(lim)
            .sort({ createdAt: -1 });
        return res.json({ total, page: pageNum, limit: lim, products });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid id' });
        const product = await Product_1.default.findById(id);
        if (!product)
            return res.status(404).json({ message: 'Not found' });
        return res.json(product);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// Create product - protected
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { name, description, price, category, imageUrl } = req.body;
        if (!name || price == null)
            return res.status(400).json({ message: 'name and price required' });
        const product = new Product_1.default({ name, description, price, category, imageUrl });
        await product.save();
        return res.status(201).json(product);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// Update
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid id' });
        const product = await Product_1.default.findByIdAndUpdate(id, update, { new: true });
        if (!product)
            return res.status(404).json({ message: 'Not found' });
        return res.json(product);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// Delete
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid id' });
        const product = await Product_1.default.findByIdAndDelete(id);
        if (!product)
            return res.status(404).json({ message: 'Not found' });
        return res.json({ message: 'deleted' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
