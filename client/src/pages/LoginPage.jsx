import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ParticlesAuth from '../components/ParticlesAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Pastikan endpoint API backend Anda berjalan di port 5000
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      localStorage.setItem('user', JSON.stringify(data.user));

      // SweetAlert SUCCESS
      Swal.fire({
        title: 'Login Berhasil!',
        text: `Selamat datang kembali, ${data.user.namaLengkap}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate('/');
      });

    } catch (err) {
      // SweetAlert ERROR
      Swal.fire({
        title: 'Akses Ditolak!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* 1. Background Partikel */}
      <ParticlesAuth />

      {/* 2. CARD LOGIN (Light Mode Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4 
                      bg-white/70 backdrop-blur-xl border border-gray-100 
                      rounded-2xl shadow-2xl animate-fade-in">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-gray-800 drop-shadow-sm">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm">
            Sistem Manajemen Kemasan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 pl-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              // Styling untuk Input Light Mode
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl 
                         text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all duration-300
                         hover:bg-gray-50 shadow-sm"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 pl-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl 
                         text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all duration-300
                         hover:bg-gray-50 shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-lg tracking-wide shadow-lg 
              transition-all duration-300 transform hover:scale-[1.02] active:scale-95 text-white
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/30'}
            `}
          >
            {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 font-light">
          &copy; 2025 Manajemen Kemasan App
        </div>
      </div>
    </div>
  );
};

export default LoginPage;