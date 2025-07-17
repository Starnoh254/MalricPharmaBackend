const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/index')

const app = express();

// CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) {
            return callback(null, true);
        }

        if (process.env.NODE_ENV === 'production') {
            // Production: Only allow specific domains
            const allowedOrigins = [
                'https://malricpharma.co.ke',
                'https://www.malricpharma.co.ke',
                'https://admin.malricpharma.co.ke',  // Admin panel
                // Add custom origins from environment variable
                ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
            ];

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        } else {
            // Development: Allow all localhost and common development ports
            const isDevelopmentOrigin =
                origin.startsWith('http://localhost:') ||
                origin.startsWith('http://127.0.0.1:') ||
                origin.startsWith('https://localhost:') ||
                origin.includes('.local:') ||
                origin.includes('ngrok.') ||           // Ngrok tunnels
                origin.includes('vercel.app') ||      // Vercel previews
                origin.includes('netlify.app');       // Netlify previews

            if (isDevelopmentOrigin) {
                callback(null, true);
            } else {
                console.log(`🚫 CORS blocked origin: ${origin}`);
                callback(new Error(`Origin ${origin} not allowed by CORS`), false);
            }
        }
    },
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