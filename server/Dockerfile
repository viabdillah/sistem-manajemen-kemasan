# --- Tahap 1: Build (Memasang dependensi) ---
# Gunakan versi Node.js yang stabil
FROM node:22-alpine AS builder

# Atur direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package.json package-lock.json* ./

# Instal hanya dependensi produksi (lebih cepat dan lebih kecil)
RUN npm ci --only=production

# Salin sisa kode sumber Anda
COPY . .

# --- Tahap 2: Rilis (Menjalankan server) ---
FROM node:22-alpine

WORKDIR /app

# Salin node_modules yang sudah diinstal dari tahap 'builder'
COPY --from=builder /app/node_modules ./node_modules
# Salin kode aplikasi dari tahap 'builder'
COPY --from=builder /app ./

# Railway akan menyediakan variabel $PORT
# 'EXPOSE' memberi tahu Docker port mana yang akan didengarkan
EXPOSE $PORT

# Perintah untuk menjalankan aplikasi Anda
# Ini akan menjalankan "start": "node src/server.js" dari package.json Anda
CMD [ "npm", "start" ]