// client/src/contexts/AuthContext.jsx

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// 1. Definisikan API_URL menggunakan environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          
          // 2. Gunakan API_URL di dalam fetch
          const response = await fetch(`${API_URL}/api/auth/verify-role`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (!response.ok) throw new Error('Gagal memverifikasi peran di backend');
          const data = await response.json();
          setCurrentUser(data.user); 
        } catch (error) {
          console.error("Error verifikasi role:", error);
          setCurrentUser(null);
          await signOut(auth);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    
    // 3. Array dependensi sekarang sudah benar (kosong)
    // karena API_URL adalah konstanta di luar hook
    return unsubscribe;
  }, []); 

  // Efek untuk redirect (sudah benar)
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


  // Fungsi logout (tetap sama)
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error saat logout:", error);
    }
  };

  const value = {
    currentUser,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};