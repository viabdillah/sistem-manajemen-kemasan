// client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// --- Impor Firebase Auth Baru ---
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Impor auth dari config
import { FaGoogle, FaEnvelope } from 'react-icons/fa'; // Impor ikon baru
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast'; // Kita akan gunakan toast untuk Lupa Sandi

// HAPUS: const RECAPTCHA_SITE_KEY = ...

const LoginPage = () => {
  // --- State Baru ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- Akhir State Baru ---
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // HAPUS: const recaptchaRef = useRef();
  // HAPUS: const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const { currentUser } = useAuth();

  // Efek untuk redirect jika user sudah login (tidak berubah)
  useEffect(() => {
    if (currentUser) {
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
  }, [currentUser, navigate]);

  // HAPUS: onRecaptchaChange dan onRecaptchaExpired

  // --- Fungsi Baru: Login Email/Password ---
  const handleEmailLogin = async (e) => {
    e.preventDefault(); // Mencegah form submit
    setLoading(true);
    setError('');

    try {
      // Panggil fungsi login Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Login berhasil.
      // 'onAuthStateChanged' di AuthContext akan otomatis
      // mendeteksi ini, memverifikasi role, dan redirect.
    } catch (firebaseError) {
      // Menangani error Firebase
      if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
        setError('Email atau password salah.');
      } else if (firebaseError.code === 'auth/invalid-credential') {
        setError('Email atau password salah.');
      }
      else {
        setError(firebaseError.message);
      }
      setLoading(false);
    }
    // Kita tidak perlu 'finally' karena halaman akan redirect jika sukses
  };

  // --- Fungsi Revisi: Login Google (hapus reCAPTCHA) ---
  const handleGoogleLogin = async () => {
    // HAPUS: Pengecekan 'isRecaptchaVerified'
    
    setLoading(true);
    setError('');

    try {
      await signInWithPopup(auth, googleProvider);
      // 'onAuthStateChanged' di AuthContext akan menangani sisanya
    } catch (error) {
      console.error("Error saat login Google:", error);
      setError(error.message || 'Terjadi kesalahan saat login.');
      setLoading(false);
    }
  };

  // --- Fungsi Baru: Lupa Kata Sandi ---
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Mohon masukkan email Anda di kolom email untuk reset password.');
      return;
    }
    const toastId = toast.loading('Mengirim link reset password...');
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Link reset password telah dikirim ke email Anda!', { id: toastId });
      setError('');
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };


  // Tampilkan "Mengarahkan..." jika user sudah login (tidak berubah)
  if (currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
        <p className="text-gray-700 text-xl">Mengarahkan...</p>
      </div>
    );
  }

  // --- JSX (Layout) Revisi Total ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      
      <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center animate-fade-in">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Selamat Datang
        </h1>
        <p className="text-gray-600 mb-8">
          Sistem Manajemen Kemasan
        </p>

        {/* Form Login Email/Password */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Input Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Input Password */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Link Lupa Password */}
          <div className="text-right">
            <button
              type="button" // Penting agar tidak submit form
              onClick={handleForgotPassword}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Lupa Kata Sandi?
            </button>
          </div>
          
          {/* Tombol Login Email */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3
                      font-semibold text-white rounded-lg shadow-lg
                      transition-all duration-300 ease-in-out
                      ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <FaEnvelope className="w-5 h-5" />
            <span>{loading ? 'Memverifikasi...' : 'Login dengan Email'}</span>
          </button>
        </form>

        {/* Divider "atau" */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">atau</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Tombol Login Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-4 py-3
                    font-semibold text-gray-700 bg-white border border-gray-300 
                    rounded-lg shadow-lg transition-all duration-300 ease-in-out
                    hover:bg-gray-100 disabled:bg-gray-200`}
        >
          <FaGoogle className="w-5 h-5 text-red-500" />
          <span>Login dengan Google</span>
        </button>

        {/* HAPUS: Komponen reCAPTCHA */}
        
        {/* Tampilan Error */}
        {error && (
          <p className="text-red-500 text-sm mt-6 animate-fade-in">{error}</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;