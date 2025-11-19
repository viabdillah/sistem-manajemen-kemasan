import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../services/supabaseClient'; // Import client
import ParticlesAuth from '../components/ParticlesAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Kita ganti username jadi email karena Supabase Auth pakai email
  const [formData, setFormData] = useState({
    email: '', 
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
      // 1. Login ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Ambil Data Profile (Role & Nama)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw new Error('Gagal mengambil data profil user.');

      // 3. Simpan ke LocalStorage (Format disamakan dengan app lama)
      const userData = {
        id: authData.user.id,
        email: authData.user.email,
        namaLengkap: profileData.full_name,
        username: profileData.username,
        role: profileData.role
      };

      localStorage.setItem('user', JSON.stringify(userData));

      Swal.fire({
        title: 'Login Berhasil!',
        text: `Selamat datang kembali, ${userData.namaLengkap}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate('/');
      });

    } catch (err) {
      Swal.fire({
        title: 'Login Gagal!',
        text: err.message || 'Email atau password salah.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticlesAuth />
      
      <div className="relative z-10 w-full max-w-md p-8 mx-4 bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Sistem Manajemen Kemasan (Supabase)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 pl-1">Email</label>
            <input
              type="email" // Ganti type jadi email
              name="email" // Ganti name jadi email
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@test.com"
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
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/30 transition-all">
            {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;