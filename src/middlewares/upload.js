const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pharma-products',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});

const parser = multer({ storage: storage });

module.exports = parser;
