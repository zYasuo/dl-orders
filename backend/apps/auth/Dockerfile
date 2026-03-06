FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json nest-cli.json ./
COPY libs/ libs/
COPY apps/auth/ apps/auth/

RUN npx prisma generate --schema=apps/auth/prisma/schema.prisma
RUN npx nest build auth

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/apps/auth/main.js"]
