// client/src/contexts/AuthContext.jsx

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// --- HAPUS SEMUA IMPORT FIREBASE ---

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// --- Helper Functions untuk Mengelola Token ---
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tetap true untuk verifikasi awal
  const navigate = useNavigate();
  const location = useLocation();

  // --- EFEK BARU: Verifikasi Sesi Saat App Load ---
  // Ini menggantikan onAuthStateChanged
  useEffect(() => {
    const verifyUserSession = async () => {
      const token = getToken();
      if (token) {
        try {
          // Kita butuh endpoint baru di backend: GET /api/auth/me
          // untuk memverifikasi token dan mengambil data user
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Sesi tidak valid atau telah berakhir');
          }

          const data = await response.json(); // Backend harus kirim { user: {...} }
          setCurrentUser(data.user);
        
        } catch (error) {
          console.error("Gagal verifikasi sesi:", error);
          removeToken(); // Token buruk, hapus
          setCurrentUser(null);
        }
      }
      // Penting: Set loading ke false SETELAH selesai, baik ada token atau tidak
      setLoading(false);
    };

    verifyUserSession();
  }, []); // <-- Array dependensi kosong, hanya berjalan sekali saat app load

  // Efek untuk redirect (Logika tidak berubah, sudah benar)
  useEffect(() => {
    if (currentUser && (location.pathname === '/login' || location.pathname === '/')) {
      const role = currentUser.role_name;
      
      switch (role) {
        case 'admin_sistem': navigate('/admin/dashboard'); break;
        case 'kasir': navigate('/kasir'); break;
        case 'operator': navigate('/operator/antrian'); break;
        case 'desainer': navigate('/desainer/antrian'); break;
        case 'manajer': navigate('/manajer/dashboard'); break;
        default: navigate('/unauthorized'); 
      }
    }
  }, [currentUser, navigate, location]);

  // --- FUNGSI LOGIN BARU (Dipanggil oleh LoginPage.jsx) ---
  const login = async (email, password) => {
    // Fungsi ini HARUS melempar error jika gagal,
    // agar LoginPage bisa menangkapnya (catch)
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json(); // Backend kirim { token: "...", user: {...} }

    if (!response.ok) {
      throw new Error(data.message || 'Gagal login');
    }

    // --- SUKSES ---
    setToken(data.token); // 1. Simpan token ke localStorage
    setCurrentUser(data.user); // 2. Atur state user
    // 3. Redirect akan ditangani oleh useEffect di atas
  };


  // --- FUNGSI LOGOUT BARU ---
  const logout = () => {
    removeToken();
    setCurrentUser(null);
    navigate('/login'); // Arahkan kembali ke login
  };

  // --- Nilai Konteks Baru ---
  const value = {
    currentUser,
    loading,
    login, // <-- Tambahkan 'login'
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};