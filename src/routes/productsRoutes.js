const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController')
const authMiddleware = require('../middlewares/authMiddleware');
const parser = require('../middlewares/upload');
/* 


#### Products
- `GET /api/products` – List all drugs
- `GET /api/products/:id` – Get drug by ID
- `POST /api/products` – Add new drug (admin only)
- `PUT /api/products/:id` – Update drug (admin only)
- `DELETE /api/products/:id` – Delete drug (admin only)

*/


router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);


router.use(authMiddleware.authenticateToken);

router.post('/', authMiddleware.authorizeAdmin, parser.single('image'), productController.createProduct);
router.put('/:id', authMiddleware.authorizeAdmin, parser.single('image'), productController.updateProduct);
router.delete('/:id', authMiddleware.authorizeAdmin, productController.deleteProduct);

module.exports = router;