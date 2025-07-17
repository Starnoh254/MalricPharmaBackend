const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestOrder() {
    try {
        // Create a test user
        const user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                password: 'test123',
                name: 'Test User'
            }
        });

        // Get a product
        const product = await prisma.product.findFirst();
        if (!product) {
            console.log('No products found to create order');
            return;
        }

        // Create a test order
        const order = await prisma.order.create({
            data: {
                orderNumber: 'TEST-001',
                userId: user.id,
                totalAmount: product.price,
                shippingInfo: { address: 'Test Address' },
                paymentMethod: 'MPESA',
                orderItems: {
                    create: {
                        productId: product.id,
                        productName: product.name,
                        price: product.price,
                        quantity: 1,
                        subtotal: product.price
                    }
                }
            }
        });

        console.log(`✅ Created test order ${order.orderNumber} referencing product: ${product.name}`);
    } catch (error) {
        console.error('Error creating test order:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestOrder();
