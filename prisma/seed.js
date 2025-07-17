const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pharmacyProducts = [
    // Pain Relief & Fever
    {
        name: "Panadol Extra (Paracetamol + Caffeine) 500mg",
        description: "Fast-acting pain relief for headaches, muscle pain, and fever. Contains paracetamol and caffeine.",
        price: 180.00,
        category: "Pain Relief",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Brufen (Ibuprofen) 400mg",
        description: "Anti-inflammatory pain reliever for muscle pain, arthritis, and inflammation.",
        price: 250.00,
        category: "Pain Relief",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },
    {
        name: "Aspirin 300mg (Disprin)",
        description: "Soluble aspirin for fast pain relief and fever reduction.",
        price: 120.00,
        category: "Pain Relief",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Voltaren Gel (Diclofenac)",
        description: "Topical anti-inflammatory gel for joint and muscle pain.",
        price: 850.00,
        category: "Pain Relief",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },

    // Antibiotics (Prescription)
    {
        name: "Amoxicillin 500mg Capsules",
        description: "Broad-spectrum antibiotic for bacterial infections. Prescription required.",
        price: 320.00,
        category: "Antibiotics",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Azithromycin 500mg (Zithromax)",
        description: "Antibiotic for respiratory tract infections. Prescription required.",
        price: 450.00,
        category: "Antibiotics",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },
    {
        name: "Ciprofloxacin 500mg",
        description: "Antibiotic for urinary tract and other bacterial infections. Prescription required.",
        price: 380.00,
        category: "Antibiotics",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },

    // Vitamins & Supplements
    {
        name: "Seven Seas Multivitamin",
        description: "Complete daily vitamin and mineral supplement for overall health.",
        price: 650.00,
        category: "Vitamins",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    },
    {
        name: "Vitamin C 1000mg Tablets",
        description: "High-strength vitamin C for immune system support.",
        price: 420.00,
        category: "Vitamins",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8702?w=400"
    },
    {
        name: "Calcium + Vitamin D3 (CalciPlus)",
        description: "Calcium supplement with vitamin D3 for bone health.",
        price: 480.00,
        category: "Vitamins",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    },
    {
        name: "Iron Tablets (Ferrous Sulphate)",
        description: "Iron supplement for anemia and iron deficiency.",
        price: 180.00,
        category: "Vitamins",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },

    // Cold & Flu
    {
        name: "Actifed Cough Syrup",
        description: "Effective cough suppressant and expectorant for dry and wet coughs.",
        price: 320.00,
        category: "Cold & Flu",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },
    {
        name: "Strepsils Throat Lozenges",
        description: "Antiseptic throat lozenges for sore throat relief.",
        price: 180.00,
        category: "Cold & Flu",
        imageUrl: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400"
    },
    {
        name: "Otrivin Nasal Spray",
        description: "Fast-acting nasal decongestant for blocked nose.",
        price: 450.00,
        category: "Cold & Flu",
        imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400"
    },
    {
        name: "Panadol Cold & Flu",
        description: "Multi-symptom relief for cold and flu symptoms.",
        price: 280.00,
        category: "Cold & Flu",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },

    // Digestive Health
    {
        name: "Eno Fruit Salt",
        description: "Fast relief from acidity, heartburn, and indigestion.",
        price: 150.00,
        category: "Digestive Health",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Buscopan (Hyoscine)",
        description: "Antispasmodic for stomach cramps and abdominal pain.",
        price: 320.00,
        category: "Digestive Health",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Loperamide (Imodium)",
        description: "Anti-diarrheal medication for acute diarrhea.",
        price: 220.00,
        category: "Digestive Health",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },
    {
        name: "ORS (Oral Rehydration Salts)",
        description: "Electrolyte solution for dehydration due to diarrhea.",
        price: 45.00,
        category: "Digestive Health",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },

    // First Aid & Wound Care
    {
        name: "Elastoplast Bandages Assorted",
        description: "Sterile adhesive bandages in various sizes.",
        price: 120.00,
        category: "First Aid",
        imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400"
    },
    {
        name: "Betadine Antiseptic Solution",
        description: "Povidone iodine antiseptic for wound cleaning.",
        price: 180.00,
        category: "First Aid",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },
    {
        name: "Germoline Antiseptic Cream",
        description: "Antiseptic cream for minor cuts and skin infections.",
        price: 250.00,
        category: "First Aid",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Cotton Wool 100g",
        description: "Sterile cotton wool for wound care and medical use.",
        price: 85.00,
        category: "First Aid",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },

    // Personal Care & Hygiene
    {
        name: "Dettol Hand Sanitizer 500ml",
        description: "70% alcohol hand sanitizer for effective germ protection.",
        price: 320.00,
        category: "Personal Care",
        imageUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400"
    },
    {
        name: "Surgical Face Masks (50 pcs)",
        description: "Disposable 3-layer surgical face masks.",
        price: 450.00,
        category: "Personal Care",
        imageUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400"
    },
    {
        name: "Thermometer Digital",
        description: "Accurate digital thermometer for body temperature.",
        price: 650.00,
        category: "Medical Devices",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    },

    // Baby Care
    {
        name: "Johnson's Baby Lotion 200ml",
        description: "Gentle, hypoallergenic moisturizing lotion for baby skin.",
        price: 380.00,
        category: "Baby Care",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Calpol Infant Suspension",
        description: "Paracetamol suspension for infant fever and pain relief.",
        price: 320.00,
        category: "Baby Care",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8702?w=400"
    },
    {
        name: "Gripe Water",
        description: "Traditional remedy for infant colic and digestive discomfort.",
        price: 180.00,
        category: "Baby Care",
        imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400"
    },

    // Allergy Relief
    {
        name: "Cetrizine 10mg (Zyrtec)",
        description: "Non-drowsy antihistamine for allergy relief.",
        price: 220.00,
        category: "Allergy Relief",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Loratadine 10mg (Clarityn)",
        description: "24-hour allergy relief for hay fever and skin allergies.",
        price: 280.00,
        category: "Allergy Relief",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },
    {
        name: "Prednisolone 5mg",
        description: "Corticosteroid for severe allergic reactions. Prescription required.",
        price: 150.00,
        category: "Allergy Relief",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },

    // Skin Care
    {
        name: "Nivea Moisturizing Cream 200ml",
        description: "Rich, nourishing cream for dry and sensitive skin.",
        price: 420.00,
        category: "Skin Care",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    },
    {
        name: "Banana Boat Sunscreen SPF 50+",
        description: "Broad-spectrum sun protection for daily use.",
        price: 650.00,
        category: "Skin Care",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    },
    {
        name: "Calamine Lotion",
        description: "Soothing lotion for itchy skin, rashes, and insect bites.",
        price: 180.00,
        category: "Skin Care",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },

    // Diabetes Care
    {
        name: "Metformin 500mg",
        description: "Diabetes medication for blood sugar control. Prescription required.",
        price: 280.00,
        category: "Diabetes Care",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Glucometer Blood Sugar Test Strips",
        description: "Blood glucose test strips for diabetes monitoring.",
        price: 1200.00,
        category: "Diabetes Care",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    },
    {
        name: "Insulin Syringes (10 pcs)",
        description: "Sterile insulin syringes for diabetes management.",
        price: 350.00,
        category: "Diabetes Care",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },

    // Heart & Blood Pressure
    {
        name: "Amlodipine 5mg",
        description: "Calcium channel blocker for high blood pressure. Prescription required.",
        price: 180.00,
        category: "Cardiovascular",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },
    {
        name: "Atenolol 50mg",
        description: "Beta-blocker for blood pressure and heart conditions. Prescription required.",
        price: 150.00,
        category: "Cardiovascular",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },
    {
        name: "Aspirin 75mg (Cardio Aspirin)",
        description: "Low-dose aspirin for heart attack and stroke prevention.",
        price: 120.00,
        category: "Cardiovascular",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },

    // Eye Care
    {
        name: "Genteal Eye Drops",
        description: "Lubricating eye drops for dry eyes.",
        price: 420.00,
        category: "Eye Care",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    },
    {
        name: "Chloramphenicol Eye Drops",
        description: "Antibiotic eye drops for bacterial eye infections. Prescription required.",
        price: 280.00,
        category: "Eye Care",
        imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400"
    },

    // Women's Health
    {
        name: "Folic Acid 5mg",
        description: "Folic acid supplement for pregnancy and anemia prevention.",
        price: 120.00,
        category: "Women's Health",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8702?w=400"
    },
    {
        name: "Pregnacare Pregnancy Vitamins",
        description: "Comprehensive vitamin supplement for pregnancy.",
        price: 850.00,
        category: "Women's Health",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    },
    {
        name: "Canesten Vaginal Cream",
        description: "Antifungal cream for vaginal yeast infections.",
        price: 420.00,
        category: "Women's Health",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
    },

    // Men's Health
    {
        name: "Finasteride 5mg (Proscar)",
        description: "Medication for enlarged prostate. Prescription required.",
        price: 1200.00,
        category: "Men's Health",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },
    {
        name: "Multivitamin for Men",
        description: "Specialized vitamin supplement for men's health needs.",
        price: 650.00,
        category: "Men's Health",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    },

    // Respiratory Health
    {
        name: "Ventolin Inhaler (Salbutamol)",
        description: "Bronchodilator for asthma and breathing difficulties. Prescription required.",
        price: 850.00,
        category: "Respiratory",
        imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400"
    },
    {
        name: "Prednisolone Tablets 5mg",
        description: "Corticosteroid for respiratory inflammation. Prescription required.",
        price: 180.00,
        category: "Respiratory",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
    },

    // Medical Devices & Equipment
    {
        name: "Blood Pressure Monitor",
        description: "Digital blood pressure monitor for home use.",
        price: 3500.00,
        category: "Medical Devices",
        imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400"
    },
    {
        name: "Pulse Oximeter",
        description: "Fingertip pulse oximeter for oxygen saturation monitoring.",
        price: 2200.00,
        category: "Medical Devices",
        imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
    },
    {
        name: "Weighing Scale Digital",
        description: "Digital weighing scale for accurate weight measurement.",
        price: 1800.00,
        category: "Medical Devices",
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400"
    }
];

async function main() {
    console.log('🏥 Starting MalricPharma database seeding...');

    try {
        // Environment-aware seeding strategy
        const NODE_ENV = process.env.NODE_ENV || 'development';
        const FORCE_RESET = process.env.FORCE_RESET === 'true';

        // Production safety: Never delete data in production unless explicitly forced
        let FULL_RESET = NODE_ENV === 'development' || FORCE_RESET;

        console.log(`🌍 Environment: ${NODE_ENV}`);
        console.log(`🔄 Reset Strategy: ${FULL_RESET ? 'FULL RESET' : 'SAFE MODE (preserve existing data)'}`);

        if (NODE_ENV === 'production' && !FORCE_RESET) {
            console.log('⚠️  PRODUCTION MODE: Full reset disabled for data safety');
            console.log('💡 To force reset in production, set FORCE_RESET=true environment variable');
            FULL_RESET = false;
        }

        if (FULL_RESET) {
            // OPTION 1: Complete database reset (removes all data including orders)
            console.log('🧹 Performing complete database reset...');

            // Clear data in correct order (respecting foreign key constraints)
            await prisma.payment.deleteMany({});
            console.log('   ✅ Cleared payments');

            await prisma.orderStatusHistory.deleteMany({});
            console.log('   ✅ Cleared order status history');

            await prisma.orderItem.deleteMany({});
            console.log('   ✅ Cleared order items');

            await prisma.order.deleteMany({});
            console.log('   ✅ Cleared orders');

            await prisma.refreshToken.deleteMany({});
            console.log('   ✅ Cleared refresh tokens');

            await prisma.product.deleteMany({});
            console.log('   ✅ Cleared products');

            await prisma.user.deleteMany({});
            console.log('   ✅ Cleared users');

        } else {
            // OPTION 2: Production-safe mode - preserve existing data
            console.log('�️  SAFE MODE: Preserving existing data...');

            // Check if any products are referenced by orders
            const productsInOrders = await prisma.orderItem.findMany({
                select: { productId: true },
                distinct: ['productId']
            });

            // Count existing products
            const existingProductsCount = await prisma.product.count();

            if (productsInOrders.length > 0) {
                console.log(`   ⚠️  Found ${productsInOrders.length} products referenced in existing orders`);
                console.log('   📝 Will add new products alongside existing ones (no deletions)');
            } else if (existingProductsCount > 0) {
                console.log(`   📦 Found ${existingProductsCount} existing products with no order references`);
                console.log('   🔄 Safe to replace products (no orders will be affected)');

                // Safe to remove products since no orders reference them
                await prisma.product.deleteMany({});
                console.log('   ✅ Cleared products (no order references found)');
            } else {
                console.log('   📭 No existing products found - fresh install');
            }
        }

        // Insert new products (or add to existing ones in safe mode)
        console.log('💊 Inserting pharmacy products...');

        let insertedCount = 0;
        let skippedCount = 0;

        for (const product of pharmacyProducts) {
            // In safe mode, check if product already exists by name
            if (!FULL_RESET) {
                const existingProduct = await prisma.product.findFirst({
                    where: { name: product.name }
                });

                if (existingProduct) {
                    console.log(`   ⏭️  Skipping existing product: ${product.name}`);
                    skippedCount++;
                    continue;
                }
            }

            await prisma.product.create({
                data: product
            });
            insertedCount++;
        }

        if (!FULL_RESET && skippedCount > 0) {
            console.log(`✅ Inserted ${insertedCount} new products, skipped ${skippedCount} existing products`);
        } else {
            console.log(`✅ Successfully seeded ${insertedCount} pharmacy products!`);
        }

        // Display comprehensive stats
        const totalProducts = await prisma.product.count();
        const categories = await prisma.product.groupBy({
            by: ['category'],
            _count: {
                category: true
            },
            _avg: {
                price: true
            }
        });

        console.log('\n📊 MalricPharma Database Statistics:');
        console.log(`Total Products: ${totalProducts}`);
        console.log(`\nProducts by Category:`);

        categories
            .sort((a, b) => b._count.category - a._count.category)
            .forEach(cat => {
                console.log(`  ${cat.category}: ${cat._count.category} products (Avg: KSh ${cat._avg.price?.toFixed(2)})`);
            });

        // Price range analysis
        const priceStats = await prisma.product.aggregate({
            _min: { price: true },
            _max: { price: true },
            _avg: { price: true }
        });

        console.log(`\n💰 Price Range Analysis:`);
        console.log(`  Minimum Price: KSh ${priceStats._min.price}`);
        console.log(`  Maximum Price: KSh ${priceStats._max.price}`);
        console.log(`  Average Price: KSh ${priceStats._avg.price?.toFixed(2)}`);

        console.log('\n🎉 Database seeding completed successfully!');

        if (NODE_ENV === 'production') {
            console.log('🏭 PRODUCTION MODE - Data preserved safely');
        } else {
            console.log('🛠️  DEVELOPMENT MODE - Full reset performed');
        }

        console.log('🌐 Your MalricPharma e-commerce platform is ready to serve customers!');

    } catch (error) {
        console.error('❌ Error during database seeding:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('💥 Fatal error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🔌 Database connection closed.');
    });