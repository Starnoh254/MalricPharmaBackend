const productService = require('../services/productService')

class productController {
    static async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await productService.getAllProducts({ page, limit });
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }


    static async getProductById(req, res) {
        const { id } = req.params;

        // Validate ID
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        try {
            const product = await productService.getProductById(id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(product);
        } catch (err) {
            console.error('Error fetching product:', err);
            res.status(500).json({ message: 'Something went wrong' });
        }
    }

    static async createProduct(req, res) {
        try {
            const { name, description, price, category } = req.body;

            if (!req.file || !req.file.path) {
                return res.status(400).json({ message: 'Image is required' });
            }

            const imageUrl = req.file.path; // Cloudinary image URL

            // Basic validation (can improve later with a library like Joi)
            if (!name || !description || !price || category == null) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const product = await productService.createProduct({
                name,
                description,
                price: parseFloat(price),
                imageUrl,
                category,
            });

            res.status(201).json(product); // created successfully
        } catch (err) {
            console.error('Error creating product:', err);
            res.status(500).json({ message: 'Failed to create product' });
        }
    }

    static async updateProduct(req, res) {
        try {
            const productId = req.params.id;
            const updates = req.body;

            const existingProduct = await productService.getProductById(productId);
            if (!existingProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // If there's a new image file uploaded, get Cloudinary URL
            if (req.file && req.file.path) {
                updates.imageUrl = req.file.path;
            }

            // Update the fields
            const updatedFields = {
                name: updates.name ?? existingProduct.name,
                description: updates.description ?? existingProduct.description,
                price: updates.price ? parseFloat(updates.price) : existingProduct.price,
                category: updates.category ?? existingProduct.category,
                imageUrl: updates.imageUrl ?? existingProduct.imageUrl,
            };

            const updatedProduct = await productService.updateProduct(productId, updatedFields);

            res.status(200).json({
                message: 'Product updated successfully',
                product: updatedProduct,
            });
        } catch (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ message: 'Failed to update product' });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const productId = req.params.id;

            // Check if the product exists
            const existingProduct = await productService.getProductById(productId);

            if (!existingProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            // Delete the product
            await productService.deleteProduct(productId);

            res.json({ message: "Product deleted successfully" });
        } catch (error) {
            console.error("Delete product error:", error);
            res.status(500).json({ message: "Failed to delete product" });
        }
    };


}

module.exports = productController;