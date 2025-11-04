// client/src/components/layout/Navbar.jsx
import React from 'react';
import { BsSearch, BsBell, BsList } from 'react-icons/bs';
import { useLayout } from '../../contexts/LayoutContext'; // 1. Impor useLayout
import { useAuth } from '../../contexts/AuthContext';     // 2. Impor useAuth

const Navbar = () => {
  const { toggleSidebar } = useLayout(); // 3. Dapatkan fungsi toggle
  const { currentUser } = useAuth();     // 4. Dapatkan data user

  // Ambil nama depan saja, atau 'User' jika tidak ada nama
  const firstName = currentUser?.full_name?.split(' ')[0] || 'User';
  
  return (
    // Navbar: putih, bayangan, padding
    <header className="bg-white shadow-sm p-4 md:p-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        
        {/* Kiri: Hamburger (Mobile) & Sapaan (Desktop) */}
        <div className="flex items-center gap-4">
          {/* Hamburger Icon (HANYA tampil di mobile, disembunyikan di 'lg') */}
          <button 
            onClick={toggleSidebar} // 5. Panggil toggle saat diklik
            className="text-gray-600 hover:text-blue-600 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <BsList size={28} />
          </button>
          
          {/* Sapaan (Sembunyikan di mobile, tampil di desktop 'lg') */}
          <h1 className="hidden lg:block text-2xl font-bold text-gray-800">
            Hello, {firstName}! 👋
          </h1>
        </div>

        {/* Tengah: Search Bar (Sembunyikan di mobile, tampil di desktop 'lg') */}
        <div className="hidden lg:block relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <BsSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-72 bg-gray-100 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        
        {/* Kanan: Ikon Notifikasi (sesuai referensi) */}
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-blue-600 relative" aria-label="Notifications">
            <BsBell size={22} />
            {/* Titik notifikasi */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;