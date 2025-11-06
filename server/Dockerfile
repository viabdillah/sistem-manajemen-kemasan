# server/Dockerfile (Menggunakan WORKDIR yang berbeda untuk memastikan tidak ada konflik)

FROM node:22-alpine

# Set working directory to /usr/src/app
WORKDIR /usr/src/app

# === HINDARI COPY GAGAL: Salin dan Instal secara manual ===

# Salin package.json dan package-lock.json dari root build context
# Karena Root Dir = server, ini menyalin server/package.json
COPY server/package*.json ./

# Jalankan instalasi dependensi
RUN npm install --only=production

# Salin seluruh isi folder server/ ke working directory
COPY server/ .

# Expose the port used by the Express server
EXPOSE 5001

# Command to run the application
CMD ["npm", "start"]