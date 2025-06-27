const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/index')

const app = express();

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com', 'https://www.yourdomain.com']  // Production URLs
        : [
            'http://localhost:3000',  // React default
            'http://localhost:3001',  // Alternative React port
            'http://localhost:8080',  // Vue.js default
            'http://127.0.0.1:3000',  // Alternative localhost
            'http://127.0.0.1:5173',  // Alternative localhost
            'http://localhost:5173',  // Alternative localhost
        ],
    credentials: true,            // Allow cookies/auth headers
    optionsSuccessStatus: 200,    // For legacy browser support
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/v1/', routes);

app.get('/', (req, res) => res.send('API is running!'));

module.exports = app;