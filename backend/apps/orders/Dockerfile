FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json nest-cli.json ./
COPY libs/ libs/
COPY apps/orders/ apps/orders/

RUN npx prisma generate --schema=apps/orders/prisma/schema.prisma
RUN npx nest build orders

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/apps/orders/main.js"]
