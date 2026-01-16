"use strict";
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const { MONGODB_URI } = require('./config');
const User = require('./models/User').default;
const Product = require('./models/Product').default;
const sampleProducts = [
    { name: 'Blue T-Shirt', description: 'Comfortable cotton tee', price: 19.99, category: 'Clothing' },
    { name: 'Red Sneakers', description: 'Stylish sneakers', price: 69.99, category: 'Footwear' },
    { name: 'Coffee Mug', description: 'Ceramic mug', price: 9.99, category: 'Home' },
    { name: 'Wireless Mouse', description: 'Ergonomic mouse', price: 29.99, category: 'Electronics' }
];
async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
        const u = new User({ username: 'admin', password: 'password' });
        await u.save();
        console.log('Created admin user: username=admin password=password');
    }
    else {
        console.log('Admin user already exists');
    }
    const count = await Product.countDocuments();
    if (count === 0) {
        await Product.insertMany(sampleProducts);
        console.log('Inserted sample products');
    }
    else {
        console.log('Products already present');
    }
    await mongoose.disconnect();
    process.exit(0);
}
seed().catch(err => {
    console.error(err);
    process.exit(1);
});
