
# 📸 Uploading Images to Cloudinary in Node.js + Express

This guide walks through how to upload product images to [Cloudinary](https://cloudinary.com/) and store the image URL in your database.

---

## 🧠 What We're Doing

1. User uploads an image via a form or API request.
2. Server receives the image and uploads it to Cloudinary.
3. Cloudinary returns a secure image URL.
4. Server stores that URL in the database as part of the product data.

---

## 🔧 Prerequisites

- Node.js + Express backend
- Cloudinary account (free)
- `cloud_name`, `api_key`, and `api_secret` from Cloudinary dashboard

---

## 📦 Dependencies

Install the necessary packages:

```bash
npm install cloudinary multer multer-storage-cloudinary
````

---

## 📁 Project Structure Overview

```
project-root/
│
├── config/
│   └── cloudinary.js
│
├── middleware/
│   └── upload.js
│
├── routes/
│   └── productRoutes.js
│
├── controllers/
│   └── ProductController.js
│
├── .env
└── ...
```

---

## 🌥️ Cloudinary Configuration (`config/cloudinary.js`)

```js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret',
});

module.exports = cloudinary;
```

Use environment variables in production.

---

## 🧵 Multer Cloudinary Storage (`middleware/upload.js`)

```js
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
```

---

## 📦 Route for Uploading Product With Image (`routes/productRoutes.js`)

```js
const express = require('express');
const router = express.Router();
const parser = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const ProductController = require('../controllers/ProductController');

router.post(
  '/products',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeAdmin,
  parser.single('image'), // name of image field in form-data
  ProductController.createProduct
);
```

---

## 🧠 Controller Logic (`controllers/ProductController.js`)

```js
static async createProduct(req, res) {
  try {
    const { name, description, price, stock } = req.body;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const imageUrl = req.file.path; // Cloudinary image URL

    const product = await productService.createProduct({
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      stock: parseInt(stock),
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
}
```

---

## 📬 Sending the Request (Postman / Frontend)

* **Method**: `POST`
* **Endpoint**: `/api/products`
* **Body Type**: `form-data`

| Key         | Type | Value                 |
| ----------- | ---- | --------------------- |
| image       | File | Upload the image file |
| name        | Text | Product name          |
| description | Text | Product description   |
| price       | Text | Product price         |
| stock       | Text | Product stock         |

---

## ✅ What You Store in the Database

You **only store the Cloudinary image URL** like:

```
https://res.cloudinary.com/your-cloud-name/image/upload/v1682322122/pharma-products/panadol.jpg
```

---

## ✅ Summary

* Cloudinary handles image hosting for you.
* You upload files using `multer` and `multer-storage-cloudinary`.
* Cloudinary gives you a URL which you save in your DB.
* Your frontend uses the URL to render images.

---

## 💡 Next Steps

* Handle image updates or deletions if needed
* Add validations and fallback images
* Optimize uploads with Cloudinary transformations

