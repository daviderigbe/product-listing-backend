import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import docsRoutes from './routes/docs';
import { errorHandler } from './middleware/error';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/docs', docsRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Product Listing API' }));

// centralized error handler
app.use(errorHandler);

export default app;
