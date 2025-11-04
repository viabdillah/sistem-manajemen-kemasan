# server/Dockerfile

# Gunakan Node.js versi 22 (sesuai log Anda)
FROM node:22-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# 1. Salin package.json dari FOLDER 'server'
# Konteks build adalah root, jadi kita tambahkan 'server/' di depannya
COPY server/package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Salin SELURUH folder 'server' (termasuk 'src/') ke '.' (yaitu /app)
COPY server/ .

# 4. Expose port
EXPOSE 5001

# 5. Jalankan server
# Karena kita menyalin seluruh folder 'server', path-nya sekarang benar
CMD ["node", "src/server.js"]