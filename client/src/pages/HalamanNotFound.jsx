// client/src/pages/HalamanNotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HalamanNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <div className="bg-white p-10 rounded-lg shadow-xl animate-fade-in">
        <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          to="/" // Arahkan kembali ke root (halaman login)
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md
                     hover:bg-blue-700 transition-colors duration-300"
        >
          Kembali ke Halaman Utama
        </Link>
      </div>
    </div>
  );
};

export default HalamanNotFound;