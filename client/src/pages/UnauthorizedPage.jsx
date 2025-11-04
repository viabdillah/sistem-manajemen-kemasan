// client/src/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <div className="bg-white p-10 rounded-lg shadow-xl animate-fade-in">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">Akses Ditolak</h2>
        <p className="text-gray-600 mb-8">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Link
          to="/login" // Arahkan kembali ke login
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md
                     hover:bg-blue-700 transition-colors duration-300"
        >
          Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;