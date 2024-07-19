// server.js
const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));