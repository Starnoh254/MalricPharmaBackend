const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// More extensive pharmacy data
const extendedPharmacyProducts = [
    // Prescription-style products (OTC versions)
    {
        name: "Amoxicillin 250mg (OTC equivalent)",
        description: "Over-the-counter antibiotic alternative for minor infections. Consult pharmacist before use.",
        price: 45.99,
        category: "Antibiotics",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Hydrocortisone Cream 1%",
        description: "Topical corticosteroid for eczema, dermatitis, and skin irritation.",
        price: 13.99,
        category: "Dermatology",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    },
    {
        name: "Insulin Test Strips",
        description: "Blood glucose test strips for diabetes monitoring. 50 strips per box.",
        price: 39.99,
        category: "Diabetes Care",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    },
    {
        name: "Blood Pressure Monitor",
        description: "Digital automatic blood pressure monitor with large display.",
        price: 89.99,
        category: "Medical Devices",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Pregnancy Test Kit",
        description: "Early detection pregnancy test with 99% accuracy. Pack of 2.",
        price: 16.99,
        category: "Women's Health",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8702?w=400"
    },
    // More categories...
];

async function seedExtended() {
    console.log('Adding extended pharmacy products...');

    for (const product of extendedPharmacyProducts) {
        await prisma.product.create({
            data: product
        });
    }

    console.log(`✅ Added ${extendedPharmacyProducts.length} more products!`);
}

// Run if called directly
if (require.main === module) {
    seedExtended()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
}

module.exports = { seedExtended };
