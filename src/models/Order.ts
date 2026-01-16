import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: { product: mongoose.Types.ObjectId; quantity: number; price: number }[];
  total: number;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);

