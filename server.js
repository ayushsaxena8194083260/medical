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

// List of allowed origins
const allowedOrigins = [
    'http://localhost:5173', // Your React app's origin
    'http://localhost:3000',
    'https://medical-api-git-main-ayush-saxenas-projects-03883bbf.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent with requests
}));

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
