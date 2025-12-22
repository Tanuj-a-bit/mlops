import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DATASET_PATH = path.join(__dirname, '../../Dataset');

// Configuration
const MAX_PRODUCTS = 1000; // Sample size for development
const MAX_USERS = 10000;
const MAX_EVENTS = 100000;

// Helper: Generate category name from ID
function generateCategoryName(categoryId: number): string {
    const categories = [
        'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
        'Books & Media', 'Toys & Games', 'Health & Beauty', 'Automotive',
        'Office Supplies', 'Pet Supplies', 'Food & Beverages', 'Jewelry',
        'Art & Crafts', 'Baby Products', 'Industrial', 'Musical Instruments'
    ];

    // Use modulo to assign names, with suffix for uniqueness
    const baseName = categories[categoryId % categories.length];
    const suffix = Math.floor(categoryId / categories.length);
    return suffix > 0 ? `${baseName} ${suffix}` : baseName;
}

// Helper: Generate slug from name
function generateSlug(name: string, id: number): string {
    return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id}`;
}

// Helper: Generate Unsplash image URL
function generateImage(category: string, seed: number): string {
    const keywords = category.toLowerCase().replace(/\s+/g, '-');
    return `https://images.unsplash.com/photo-${1500000000000 + seed}?w=400&q=80`;
}

// Helper: Generate product name
function generateProductName(categoryName: string, productId: number): string {
    const adjectives = ['Premium', 'Deluxe', 'Professional', 'Essential', 'Modern', 'Classic', 'Advanced', 'Eco-Friendly'];
    const nouns = ['Pro', 'Plus', 'Elite', 'Max', 'Ultra', 'Prime', 'Special Edition'];

    const adj = adjectives[productId % adjectives.length];
    const noun = nouns[Math.floor(productId / adjectives.length) % nouns.length];

    return `${adj} ${categoryName} ${noun}`;
}

// Helper: Generate description
function generateDescription(name: string): string {
    const templates = [
        `High-quality ${name} designed for maximum performance and durability. Features premium materials and modern design.`,
        `Experience excellence with this ${name}. Perfect for both professionals and enthusiasts alike.`,
        `Upgrade your collection with this ${name}. Combines functionality with style for outstanding results.`,
        `Premium ${name} that exceeds expectations. Engineered for reliability and long-lasting use.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

// Helper: Parse CSV file
function parseCSV<T>(filePath: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data as T))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Helper: Parse CSV with limit (stream-based)
function parseCSVWithLimit<T>(filePath: string, limit: number): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const results: T[] = [];
        let count = 0;

        const stream = fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                if (count < limit) {
                    results.push(data as T);
                    count++;
                } else {
                    stream.destroy();
                }
            })
            .on('end', () => resolve(results))
            .on('close', () => resolve(results))
            .on('error', reject);
    });
}

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Step 1: Load Categories
    console.log('📦 Loading categories...');
    type CategoryRow = { categoryid: string; parentid: string };
    const categoryRows = await parseCSV<CategoryRow>(path.join(DATASET_PATH, 'category_tree.csv'));

    const categoryMap = new Map<number, { id: number; parentId: number | null; name: string; slug: string; image: string }>();

    for (const row of categoryRows) {
        const id = parseInt(row.categoryid);
        const parentId = row.parentid ? parseInt(row.parentid) : null;
        const name = generateCategoryName(id);
        const slug = generateSlug(name, id);
        const image = generateImage(name, id);

        categoryMap.set(id, { id, parentId, name, slug, image });
    }

    // Insert categories (handle parent-child relationships)
    const categories = Array.from(categoryMap.values());
    const rootCategories = categories.filter(c => c.parentId === null);
    const childCategories = categories.filter(c => c.parentId !== null);

    console.log(`  - Inserting ${rootCategories.length} root categories...`);
    for (const cat of rootCategories) {
        await prisma.category.create({ data: cat });
    }

    console.log(`  - Inserting ${childCategories.length} child categories...`);
    for (const cat of childCategories) {
        // Only insert if parent exists
        if (categoryMap.has(cat.parentId!)) {
            await prisma.category.create({ data: cat }).catch(() => {
                // Skip if parent doesn't exist in DB yet
            });
        }
    }

    console.log(`✅ Loaded ${categories.length} categories\n`);

    // Step 2: Load Products
    console.log(`📦 Loading products (sampling ${MAX_PRODUCTS} items)...`);
    type PropertyRow = { timestamp: string; itemid: string; property: string; value: string };
    const propertyRows = await parseCSVWithLimit<PropertyRow>(
        path.join(DATASET_PATH, 'item_properties_part1.csv'),
        MAX_PRODUCTS * 10 // Over-sample to ensure we get enough unique items
    );

    // Group properties by itemId
    const productMap = new Map<number, { categoryId?: number; properties: Record<string, string> }>();

    for (const row of propertyRows) {
        const itemId = parseInt(row.itemid);
        if (!productMap.has(itemId)) {
            productMap.set(itemId, { properties: {} });
        }

        const product = productMap.get(itemId)!;

        // Extract categoryId if present
        if (row.property === 'categoryid') {
            product.categoryId = parseInt(row.value);
        }

        // Store all properties
        product.properties[row.property] = row.value;
    }

    // Sample products
    const productEntries = Array.from(productMap.entries()).slice(0, MAX_PRODUCTS);
    console.log(`  - Processing ${productEntries.length} unique products...`);

    let insertedCount = 0;
    for (const [itemId, data] of productEntries) {
        // Determine category
        let categoryId = data.categoryId;
        if (!categoryId || !categoryMap.has(categoryId)) {
            // Assign random category if missing or invalid
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            categoryId = randomCategory.id;
        }

        const category = categoryMap.get(categoryId)!;
        const name = generateProductName(category.name, itemId);
        const description = generateDescription(name);

        // Generate price (extract from properties or random)
        let price = 0;
        for (const [key, value] of Object.entries(data.properties)) {
            if (key.includes('price') || key.includes('790')) {
                const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
                if (numericValue > 0 && numericValue < 10000) {
                    price = numericValue / 100; // Assume cents
                    break;
                }
            }
        }

        if (price === 0) {
            price = Math.random() * 1990 + 10; // Random $10-$2000
        }

        const image = generateImage(category.name, itemId);
        const rating = Math.random() * 1.5 + 3.5; // 3.5-5.0 stars
        const reviewCount = Math.floor(Math.random() * 5000);
        const inStock = Math.random() > 0.1; // 90% in stock

        try {
            await prisma.product.create({
                data: {
                    id: itemId,
                    categoryId,
                    name,
                    description,
                    price: Math.round(price * 100) / 100,
                    image,
                    rating: Math.round(rating * 10) / 10,
                    reviewCount,
                    inStock,
                    properties: JSON.stringify(data.properties),
                },
            });
            insertedCount++;
        } catch (error) {
            // Skip duplicates or invalid data
        }
    }

    console.log(`✅ Loaded ${insertedCount} products\n`);

    // Step 3: Load Users
    console.log(`📦 Loading users (sampling ${MAX_USERS} visitors)...`);
    type EventRow = { timestamp: string; visitorid: string; event: string; itemid: string; transactionid: string };
    const eventRows = await parseCSVWithLimit<EventRow>(
        path.join(DATASET_PATH, 'events.csv'),
        MAX_EVENTS
    );

    const userIds = new Set<number>();
    eventRows.forEach(row => userIds.add(parseInt(row.visitorid)));

    const sampleUserIds = Array.from(userIds).slice(0, MAX_USERS);
    console.log(`  - Creating ${sampleUserIds.length} users...`);

    // Create Specific Roles (Admin & Seller)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Admin
    await prisma.user.upsert({
        where: { email: 'admin@shopmlops.com' },
        update: {},
        create: {
            id: 100000, // Use a high ID to avoid conflict
            email: 'admin@shopmlops.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'
        }
    });

    // Seller
    const seller = await prisma.user.upsert({
        where: { email: 'seller@shopmlops.com' },
        update: {},
        create: {
            id: 100001,
            email: 'seller@shopmlops.com',
            name: 'Seller User',
            password: hashedPassword,
            role: 'SELLER',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
        }
    });

    // Create Seller Profile
    await prisma.sellerProfile.create({
        data: {
            userId: seller.id,
            storeName: 'Official ShopMLOps Store',
            description: 'The official store for premium products.'
        }
    }).catch(() => { }); // Ignore if exists

    console.log('  - Created Admin (admin@shopmlops.com) and Seller (seller@shopmlops.com)');

    for (const userId of sampleUserIds) {
        const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eva', 'Frank'];
        const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
        const name = `${names[userId % names.length]} ${surnames[Math.floor(userId / names.length) % surnames.length]}`;
        const email = `visitor${userId}@shopmlops.com`;

        await prisma.user.create({
            data: {
                id: userId,
                email,
                name,
                password: hashedPassword, // Default password for all visitors
                role: 'USER'
            },
        }).catch(() => {
            // Skip duplicates
        });
    }

    console.log(`✅ Loaded ${sampleUserIds.length} users\n`);

    // Step 4: Load Events
    console.log(`📦 Loading events (${eventRows.length} events)...`);

    const validProducts = await prisma.product.findMany({ select: { id: true } });
    const validProductIds = new Set(validProducts.map(p => p.id));

    let eventCount = 0;
    for (const row of eventRows) {
        const visitorId = parseInt(row.visitorid);
        const itemId = parseInt(row.itemid);

        // Only insert if user and product exist
        if (sampleUserIds.includes(visitorId) && validProductIds.has(itemId)) {
            await prisma.event.create({
                data: {
                    timestamp: BigInt(row.timestamp),
                    visitorId,
                    eventType: row.event,
                    itemId,
                    transactionId: row.transactionid || null,
                },
            }).catch(() => {
                // Skip errors
            });
            eventCount++;
        }
    }

    console.log(`✅ Loaded ${eventCount} events\n`);

    // Statistics
    const stats = {
        categories: await prisma.category.count(),
        products: await prisma.product.count(),
        users: await prisma.user.count(),
        events: await prisma.event.count(),
    };

    console.log('📊 Database Statistics:');
    console.log(`  - Categories: ${stats.categories}`);
    console.log(`  - Products: ${stats.products}`);
    console.log(`  - Users: ${stats.users}`);
    console.log(`  - Events: ${stats.events}`);
    console.log('\n✅ Seed completed successfully!\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
