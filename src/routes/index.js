const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const productRoutes = require('./productsRoutes')

// Map routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

module.exports = router;