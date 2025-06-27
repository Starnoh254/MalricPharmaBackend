const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class productService {
    static async getAllProducts({ page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const products = await prisma.product.findMany({
            skip,
            take: limit,
        });

        const total = await prisma.product.count();

        return { total, page, limit, products };
    }

    static async getProductById(id) {
        return await prisma.product.findUnique({
            where: {
                id: parseInt(id), // Prisma expects a number for 'id'
            },
        }); // Might be null if not found
    }

    static async createProduct(data) {
        const { name, description, price, imageUrl, category } = data;

        return await prisma.product.create({
            data: {
                name,
                description,
                price,
                imageUrl,
                category,
            },
        });
    }

    static async updateProduct(productId, updatedFields) {
        return await prisma.product.update({
            where: { id: productId },
            data: updatedFields,
        });
    }

    static async deleteProduct(productId) {
        return await prisma.product.delete({
            where: { id: productId },
        });
    }



}



module.exports = productService