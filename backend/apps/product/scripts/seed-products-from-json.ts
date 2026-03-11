
import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvFile(envPath: string): void {
    try {
        const content = fs.readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eq = trimmed.indexOf('=');
                if (eq > 0) {
                    const key = trimmed.slice(0, eq).trim();
                    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
                    if (key && process.env[key] === undefined) process.env[key] = value;
                }
            }
        }
    } catch {
        // .env optional
    }
}
loadEnvFile(path.resolve(__dirname, '../.env'));

const COLLECTION = 'products';

interface ProductDoc {
    _id: string;
    name: string;
    description: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

interface JsonProduct {
    timestamp?: string;
    title?: string;
    description?: string;
    initial_price?: number | null;
    final_price?: number | null;
    [key: string]: unknown;
}

function parseDate(value: unknown): Date {
    if (typeof value === 'string') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
}

function toProductDoc(item: JsonProduct, index: number): {
    _id: string;
    name: string;
    description: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
} {
    const name = (item.title && String(item.title).trim()) || `Product ${index + 1}`;
    const description =
        (item.description && String(item.description).trim()) || name || 'No description';
    const price =
        typeof item.final_price === 'number' && !Number.isNaN(item.final_price)
            ? item.final_price
            : typeof item.initial_price === 'number' && !Number.isNaN(item.initial_price)
              ? item.initial_price
              : 0;
    const now = parseDate(item.timestamp) || new Date();
    return {
        _id: crypto.randomUUID(),
        name: name.slice(0, 500),
        description: description.slice(0, 5000),
        price: Math.max(0, Math.min(1000000, price)),
        createdAt: now,
        updatedAt: now,
    };
}

async function main() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dl_product_svc';
    const jsonPath = (process.argv[2] && process.argv[2].trim()) || process.env.SEED_JSON_PATH;
    const batchSize = parseInt(process.env.SEED_BATCH_SIZE || '500', 10);
    const limit = process.env.SEED_LIMIT ? parseInt(process.env.SEED_LIMIT, 10) : undefined;

    if (!jsonPath || !fs.existsSync(jsonPath)) {
        console.error('Pass the JSON file path as argument or set SEED_JSON_PATH:');
        console.error('  npm run seed:product -- "C:\\Users\\...\\Downloads\\csvjson.json"');
        if (jsonPath) console.error('File not found:', jsonPath);
        process.exit(1);
    }

    console.log('Reading file:', jsonPath);
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    let data: JsonProduct[];
    try {
        data = JSON.parse(raw) as JsonProduct[];
    } catch (e) {
        console.error('Invalid JSON:', e);
        process.exit(1);
    }

    if (!Array.isArray(data)) {
        console.error('JSON must be an array of objects.');
        process.exit(1);
    }

    const toImport = limit ? data.slice(0, limit) : data;
    console.log(`Items in JSON: ${data.length}. To import: ${toImport.length}`);

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection<ProductDoc>(COLLECTION);

        let inserted = 0;
        for (let i = 0; i < toImport.length; i += batchSize) {
            const batch = toImport.slice(i, i + batchSize);
            const docs = batch.map((item, idx) => toProductDoc(item, i + idx));
            await collection.insertMany(docs);
            inserted += docs.length;
            console.log(`Inserted ${inserted}/${toImport.length}`);
        }

        console.log('Done. Total inserted:', inserted);
    } finally {
        await client.close();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
