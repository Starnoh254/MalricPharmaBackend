const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pharmacyProducts = [
    // Pain Relief & Fever
    {
        name: "Paracetamol 500mg",
        description: "Effective pain relief and fever reducer. Suitable for headaches, muscle pain, and cold symptoms.",
        price: 8.99,
        category: "Pain Relief",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Ibuprofen 400mg",
        description: "Anti-inflammatory pain reliever for muscle pain, arthritis, and inflammation.",
        price: 12.50,
        category: "Pain Relief",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },
    {
        name: "Aspirin 75mg",
        description: "Low-dose aspirin for cardiovascular protection and mild pain relief.",
        price: 6.99,
        category: "Pain Relief",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },

    // Vitamins & Supplements
    {
        name: "Vitamin D3 1000IU",
        description: "Essential vitamin D supplement for bone health and immune system support.",
        price: 15.99,
        category: "Vitamins",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    },
    {
        name: "Multivitamin Complex",
        description: "Complete daily vitamin and mineral supplement for overall health.",
        price: 24.99,
        category: "Vitamins",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8702?w=400"
    },
    {
        name: "Omega-3 Fish Oil",
        description: "High-quality omega-3 fatty acids for heart and brain health.",
        price: 29.99,
        category: "Supplements",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    },

    // Cold & Flu
    {
        name: "Cough Syrup",
        description: "Effective cough suppressant and expectorant for dry and productive coughs.",
        price: 11.99,
        category: "Cold & Flu",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },
    {
        name: "Throat Lozenges",
        description: "Soothing throat lozenges with honey and lemon for sore throat relief.",
        price: 7.50,
        category: "Cold & Flu",
        imageUrl: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400"
    },
    {
        name: "Nasal Decongestant Spray",
        description: "Fast-acting nasal spray for blocked nose and sinus congestion.",
        price: 9.99,
        category: "Cold & Flu",
        imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400"
    },

    // Digestive Health
    {
        name: "Antacid Tablets",
        description: "Quick relief from heartburn, acid indigestion, and upset stomach.",
        price: 8.49,
        category: "Digestive Health",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Probiotics Capsules",
        description: "Live cultures to support digestive health and immune system.",
        price: 32.99,
        category: "Digestive Health",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },

    // First Aid
    {
        name: "Bandages Assorted Pack",
        description: "Sterile adhesive bandages in various sizes for cuts and scrapes.",
        price: 5.99,
        category: "First Aid",
        imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400"
    },
    {
        name: "Antiseptic Cream",
        description: "Antibacterial cream for minor cuts, burns, and skin infections.",
        price: 7.99,
        category: "First Aid",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },

    // Personal Care
    {
        name: "Hand Sanitizer 500ml",
        description: "70% alcohol hand sanitizer for effective germ protection.",
        price: 4.99,
        category: "Personal Care",
        imageUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400"
    },
    {
        name: "Thermometer Digital",
        description: "Accurate digital thermometer for quick temperature readings.",
        price: 19.99,
        category: "Medical Devices",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    },

    // Baby Care
    {
        name: "Baby Lotion 200ml",
        description: "Gentle, hypoallergenic moisturizing lotion for sensitive baby skin.",
        price: 12.99,
        category: "Baby Care",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Infant Pain Relief Drops",
        description: "Gentle pain and fever relief specially formulated for infants.",
        price: 13.99,
        category: "Baby Care",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8702?w=400"
    },

    // Allergy Relief
    {
        name: "Antihistamine Tablets",
        description: "Non-drowsy allergy relief for hay fever, pet allergies, and skin reactions.",
        price: 14.99,
        category: "Allergy Relief",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Eye Drops Allergy Relief",
        description: "Soothing eye drops for itchy, watery eyes caused by allergies.",
        price: 10.99,
        category: "Allergy Relief",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },

    // Skin Care
    {
        name: "Moisturizing Cream",
        description: "Rich, nourishing cream for dry and sensitive skin conditions.",
        price: 16.99,
        category: "Skin Care",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    },
    {
        name: "Sunscreen SPF 50+",
        description: "Broad-spectrum sun protection for daily use and outdoor activities.",
        price: 18.99,
        category: "Skin Care",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    }
];

async function main() {
    console.log('Starting database seeding...');

    // Clear existing products (optional)
    console.log('Clearing existing products...');
    await prisma.product.deleteMany({});

    // Insert new products
    console.log('Inserting pharmacy products...');

    for (const product of pharmacyProducts) {
        await prisma.product.create({
            data: product
        });
    }

    console.log(`✅ Successfully seeded ${pharmacyProducts.length} products!`);

    // Display some stats
    const totalProducts = await prisma.product.count();
    const categories = await prisma.product.groupBy({
        by: ['category'],
        _count: {
            category: true
        }
    });

    console.log('\n📊 Database Statistics:');
    console.log(`Total Products: ${totalProducts}`);
    console.log('\nProducts by Category:');
    categories.forEach(cat => {
        console.log(`  ${cat.category}: ${cat._count.category} products`);
    });
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
