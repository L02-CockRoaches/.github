# Giai đoạn 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Sao chép package.json và cài đặt dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Sao chép mã nguồn và build
COPY . .
RUN npx prisma generate
RUN npm run build

# Giai đoạn 2: Run (Sử dụng Image nhỏ hơn để tiết kiệm tài nguyên)
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Mở cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "run", "start:prod"]
