// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

// Komponen ini akan menerima daftar role yang diizinkan
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // 1. Jika tidak ada user (belum login)
    // Redirect ke halaman login, simpan lokasi asal
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role_name)) {
    // 2. Jika user login, TAPI role-nya tidak ada di 'allowedRoles'
    // Redirect ke halaman "Akses Ditolak"
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Jika user login DAN role-nya diizinkan
  return children; // Tampilkan halaman yang diminta
};

export default ProtectedRoute;