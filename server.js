// server.js
const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const cors = require('cors');  // Import CORS

const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your React app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent
  }))

// Connect to the database
connectDB();
// Init middleware
app.use(express.json({ extended: false }));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cart', cartRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
