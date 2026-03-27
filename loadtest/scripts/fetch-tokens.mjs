import { readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const authBase = (process.env.AUTH_BASE_URL || 'http://127.0.0.1:3005').replace(/\/$/, '');
const usersPath = process.env.USERS_FILE || 'loadtest/k6/test-users.json';
const outPath = process.env.OUTPUT_TOKENS_FILE || 'loadtest/k6/tokens.json';
const signinDelayMs = Number(process.env.SIGNIN_DELAY_MS || '7000');

function parseAccessToken(json) {
    const token = json?.data?.accessToken ?? json?.accessToken;
    if (!token || typeof token !== 'string') {
        throw new Error('Resposta sem accessToken (esperado envelope { success, data: { accessToken } }).');
    }
    return token;
}

async function signin(email, password) {
    const url = `${authBase}/api/v1/auth/signin`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch {
        json = null;
    }
    if (!res.ok) {
        const msg = json?.message || text;
        throw new Error(`signin ${res.status}: ${msg}`);
    }
    return parseAccessToken(json);
}

const raw = readFileSync(usersPath, 'utf8');
const users = JSON.parse(raw);
if (!Array.isArray(users) || users.length === 0) {
    throw new Error(`${usersPath} deve ser um array não vazio de { email, password }`);
}

const tokens = [];
for (let i = 0; i < users.length; i++) {
    const { email, password } = users[i];
    if (!email || !password) {
        throw new Error(`Entrada ${i}: email e password obrigatórios`);
    }
    const token = await signin(email, password);
    tokens.push({ token });
    if (i < users.length - 1 && signinDelayMs > 0) {
        await delay(signinDelayMs);
    }
}

writeFileSync(outPath, `${JSON.stringify(tokens, null, 2)}\n`, 'utf8');
console.log(`Escritos ${tokens.length} token(s) em ${outPath}`);
