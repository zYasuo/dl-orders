import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const ordersBase = (__env('ORDERS_BASE_URL') || __env('ORDERS_BASE') || 'http://127.0.0.1:3001').replace(/\/$/, '');
const productId = __env('K6_PRODUCT_ID') || '';
const quantity = Number(__env('K6_QUANTITY') || '1');
const recipient = __env('K6_RECIPIENT') || 'loadtest@example.com';

function __env(k) {
    return __ENV[k] || '';
}

const tokenEntries = __ENV.K6_JWT
    ? [{ token: __ENV.K6_JWT }]
    : new SharedArray('tokens', function () {
          const path = __ENV.K6_TOKENS_FILE || 'loadtest/k6/tokens.json';
          const raw = open(path);
          const arr = JSON.parse(raw);
          if (!Array.isArray(arr) || arr.length === 0) {
              throw new Error('K6_TOKENS_FILE must be a non-empty JSON array of { "token": "..." }');
          }
          return arr;
      });

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.5'],
        http_req_duration: ['p(95)<15000'],
    },
};

export function setup() {
    if (!productId) {
        throw new Error('Define K6_PRODUCT_ID (id de produto existente com estoque em ambiente de teste).');
    }
    if (!tokenEntries.length) {
        throw new Error('Nenhum token: use K6_JWT ou gere loadtest/k6/tokens.json com loadtest/scripts/fetch-tokens.mjs');
    }
}

export default function () {
    const entry = tokenEntries[__VU % tokenEntries.length];
    const idem = uuidv4();
    const body = JSON.stringify({
        productId,
        quantity,
        description: 'k6 direct',
        recipient,
        idempotencyKey: idem,
    });
    const res = http.post(`${ordersBase}/api/v1/orders`, body, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${entry.token}`,
            'Idempotency-Key': idem,
        },
    });
    check(res, {
        '202 accepted': (r) => r.status === 202,
        'not 401': (r) => r.status !== 401,
        'not 429': (r) => r.status !== 429,
    });
}
