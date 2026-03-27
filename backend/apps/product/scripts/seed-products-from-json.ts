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
          const value = trimmed
            .slice(eq + 1)
            .trim()
            .replace(/^["']|["']$/g, '');
          if (key && process.env[key] === undefined) process.env[key] = value;
        }
      }
    }
  } catch {}
}

loadEnvFile(path.resolve(__dirname, '../.env'));
loadEnvFile(path.resolve(__dirname, '../../../.env'));

const COLLECTION = 'products';

interface ProductDoc {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface JsonProduct {
  timestamp?: string;
  title?: string;
  description?: string;
  initial_price?: number | null;
  final_price?: number | null;
  image_url?: string | null;
  [key: string]: unknown;
}

function parseDate(value: unknown): Date {
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
}

function toProductDoc(item: JsonProduct, index: number): ProductDoc {
  const name = (item.title && String(item.title).trim()) || `Product ${index + 1}`;
  const description =
    (item.description && String(item.description).trim()) || name || 'No description';
  const price =
    typeof item.final_price === 'number' && !Number.isNaN(item.final_price)
      ? item.final_price
      : typeof item.initial_price === 'number' && !Number.isNaN(item.initial_price)
        ? item.initial_price
        : 0;
  const rawImage = item.image_url;
  const imageUrl =
    typeof rawImage === 'string' && rawImage.trim().length > 0 ? rawImage.trim() : null;
  const now = parseDate(item.timestamp) || new Date();
  return {
    _id: crypto.randomUUID(),
    name: name.slice(0, 500),
    description: description.slice(0, 5000),
    price: Math.max(0, Math.min(1000000, price)),
    imageUrl,
    createdAt: now,
    updatedAt: now,
  };
}

function inventoryLineName(productName: string, productId: string): string {
  const compact = productId.replace(/-/g, '').slice(0, 8);
  const suffix = ` [${compact}]`;
  const maxBase = 200 - suffix.length;
  return `${productName.slice(0, Math.max(1, maxBase))}${suffix}`;
}

interface SeedInventoryParams {
  baseUrl: string;
  serviceSecret: string;
  quantity: number;
  maxQuantity: number;
  minQuantity: number;
  lowStockThreshold: number;
  createdBy: string;
}

async function postInventory(doc: ProductDoc, params: SeedInventoryParams): Promise<void> {
  const url = `${params.baseUrl.replace(/\/$/, '')}/api/v1/inventories`;
  const body = {
    productId: doc._id,
    name: inventoryLineName(doc.name, doc._id),
    quantity: params.quantity,
    maxQuantity: params.maxQuantity,
    minQuantity: params.minQuantity,
    lowStockThreshold: params.lowStockThreshold,
    createdBy: params.createdBy,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-service-auth': params.serviceSecret,
    },
    body: JSON.stringify(body),
  });
  if (res.ok) return;
  const text = await res.text();
  let msg = text;
  try {
    const j = JSON.parse(text) as { message?: string };
    if (typeof j.message === 'string') {
      msg = j.message;
    }
  } catch {}
  if (
    res.status === 400 &&
    (msg.includes('already exists') || msg.includes('Inventory already exists'))
  ) {
    return;
  }
  throw new Error(`Inventory seed failed for ${doc._id}: ${res.status} ${msg}`);
}

async function seedInventoryBatch(docs: ProductDoc[], params: SeedInventoryParams): Promise<void> {
  for (const doc of docs) {
    await postInventory(doc, params);
  }
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dl_product_svc';
  const defaultPath = path.resolve(__dirname, 'seed-data/csvjson.json');
  const jsonPath =
    (process.argv[2] && process.argv[2].trim()) ||
    process.env.SEED_JSON_PATH ||
    (fs.existsSync(defaultPath) ? defaultPath : undefined);
  const batchSize = parseInt(process.env.SEED_BATCH_SIZE || '500', 10);
  const limit = process.env.SEED_LIMIT ? parseInt(process.env.SEED_LIMIT, 10) : undefined;
  const inventoryUrl = process.env.INVENTORY_SERVICE_URL?.trim();
  const serviceSecret = process.env.SERVICE_AUTH_SECRET?.trim();
  const seedInvQty = parseInt(process.env.SEED_INVENTORY_QUANTITY || '50', 10);
  const seedInvMax = parseInt(process.env.SEED_INVENTORY_MAX || '100', 10);
  const seedInvMin = parseInt(process.env.SEED_INVENTORY_MIN || '10', 10);
  const seedInvLow = parseInt(process.env.SEED_INVENTORY_LOW_STOCK_THRESHOLD || '5', 10);
  const seedInvBy = (process.env.SEED_INVENTORY_CREATED_BY || 'seed@dl-orders.local').trim();

  if (!jsonPath || !fs.existsSync(jsonPath)) {
    console.error('Pass the JSON file path as argument or set SEED_JSON_PATH.');
    console.error('Or put your file in: apps/product/scripts/seed-data/csvjson.json');
    console.error('  npm run seed:product   (uses seed-data/csvjson.json if present)');
    console.error('  npm run seed:product -- "path/to/your.json"');
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
  let inventoryParams: SeedInventoryParams | null = null;
  if (inventoryUrl && serviceSecret) {
    inventoryParams = {
      baseUrl: inventoryUrl,
      serviceSecret,
      quantity: seedInvQty,
      maxQuantity: seedInvMax,
      minQuantity: seedInvMin,
      lowStockThreshold: seedInvLow,
      createdBy: seedInvBy,
    };
    console.log('Inventory seed: enabled →', inventoryUrl);
  } else {
    console.log(
      'Inventory seed: skipped (set INVENTORY_SERVICE_URL and SERVICE_AUTH_SECRET to create stock rows).',
    );
  }

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
      if (inventoryParams) {
        await seedInventoryBatch(docs, inventoryParams);
        console.log(`Inventory synced for batch ending ${inserted}/${toImport.length}`);
      }
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
