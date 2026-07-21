FROM node:20-alpine AS builder

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/prisma ./prisma
RUN npx prisma generate

COPY server/src ./src
COPY server/tsconfig.json ./

RUN npx tsc

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]
