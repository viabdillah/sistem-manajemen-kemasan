// client/src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Pastikan semua ikon ini ada di impor Anda
import { 
  BsGridFill, BsPeopleFill, BsBoxSeam, BsPaletteFill, 
  BsPersonBadgeFill, BsCashCoin, BsBoxArrowLeft,
  BsPersonPlusFill, BsClockHistory, BsWalletFill,
  BsBoxes, BsClipboardData, BsGear, BsPlusCircleFill
} from 'react-icons/bs';

// Komponen helper untuk link
const SidebarLink = ({ to, icon, label, end }) => {
  // Kelas dasar untuk link, termasuk transisi dan transform
  const baseClasses = "flex items-center gap-4 p-3 rounded-lg justify-start transition-all duration-300 ease-in-out transform";
  
  // Kelas saat link Aktif
  const activeClass = "bg-blue-600 text-white shadow-lg translate-x-2";
  
  // Kelas saat link Tidak Aktif (termasuk efek hover)
  const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-blue-600 hover:translate-x-2";
  
  return (
    <NavLink
      to={to}
      end={end} // Prop 'end' untuk NavLink yang spesifik
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClass : inactiveClass}`
      }
    >
      {/* Ikon (selalu tampil) */}
      <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
      
      {/* Label (selalu tampil) */}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};


const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const logoutToast = toast.loading('Proses logout...');
    try {
      await logout();
      toast.success('Logout berhasil!', { id: logoutToast });
      navigate('/login');
    } catch (error) {
      console.error("Error saat logout:", error); 
      toast.error('Logout gagal.', { id: logoutToast });
    }
  };

  // Daftar link dinamis berdasarkan role
  const roleLinks = {
    admin_sistem: [
      { to: '/admin/dashboard', icon: <BsGridFill size={20} />, label: 'Dashboard' },
      { to: '/admin/users', icon: <BsPeopleFill size={20} />, label: 'Pengguna' },
      { to: '/kasir/pelanggan/tambah', icon: <BsPersonPlusFill size={20} />, label: 'Tambah Pelanggan' },
      { to: '/kasir/pesanan/tambah', icon: <BsPlusCircleFill size={20} />, label: 'Buat Pesanan Baru' },
      { to: '/kasir/pesanan', icon: <BsClockHistory size={20} />, label: 'Riwayat Pesanan', end: true },
      { to: '/keuangan', icon: <BsWalletFill size={20} />, label: 'Keuangan' },
      { to: '/desainer/antrian', icon: <BsPaletteFill size={20} />, label: 'Antrian Desain' },
      { to: '/desainer/riwayat', icon: <BsClockHistory size={20} />, label: 'Riwayat Desain' },
      { to: '/operator/antrian', icon: <BsGear size={20} />, label: 'Antrian Produksi' },
      { to: '/inventory/stok', icon: <BsBoxes size={20} />, label: 'Stok Bahan' },
      { to: '/inventory/riwayat', icon: <BsClipboardData size={20} />, label: 'Riwayat Bahan' },
    ],
    kasir: [
      { to: '/kasir', icon: <BsCashCoin size={20} />, label: 'Dashboard Kasir' },
      { to: '/kasir/pelanggan/tambah', icon: <BsPersonPlusFill size={20} />, label: 'Tambah Pelanggan' },
      { to: '/kasir/pesanan/tambah', icon: <BsPlusCircleFill size={20} />, label: 'Buat Pesanan Baru' },
      { to: '/kasir/pesanan', icon: <BsClockHistory size={20} />, label: 'Riwayat Pesanan', end: true },
      { to: '/keuangan', icon: <BsWalletFill size={20} />, label: 'Keuangan' },
    ],
    desainer: [
      { to: '/desainer/antrian', icon: <BsPaletteFill size={20} />, label: 'Antrian Desain' },
      { to: '/desainer/riwayat', icon: <BsClockHistory size={20} />, label: 'Riwayat Desain' },
    ],
    operator: [
      { to: '/operator/antrian', icon: <BsGear size={20} />, label: 'Antrian Produksi' },
      { to: '/inventory/stok', icon: <BsBoxes size={20} />, label: 'Stok Bahan' },
      { to: '/inventory/riwayat', icon: <BsClipboardData size={20} />, label: 'Riwayat Bahan' },
    ],
    manajer: [
      { to: '/manajer/dashboard', icon: <BsPersonBadgeFill size={20} />, label: 'Dashboard Manajer' },
      { to: '/manajer/laporan-produksi', icon: <BsClipboardData size={20} />, label: 'Laporan Produksi' }, // <-- LINK BARU
      { to: '/keuangan', icon: <BsWalletFill size={20} />, label: 'Keuangan' },
      { to: '/inventory/stok', icon: <BsBoxes size={20} />, label: 'Stok Bahan' },
      { to: '/inventory/riwayat', icon: <BsClipboardData size={20} />, label: 'Riwayat Bahan' },
    ],
  };

  const links = roleLinks[currentUser?.role_name] || [];

  return (
    // 'h-full' penting, mengambil tinggi dari parent (MainLayout)
    // 'flex flex-col' adalah kuncinya
    <aside className="w-64 bg-white h-full flex flex-col shadow-lg">
      
      {/* Wrapper 1: Profil + Navigasi */}
      {/* 'flex-grow' mendorong Wrapper 2 (Logout) ke bawah */}
      {/* 'flex flex-col' membuatnya jadi container flex */}
      {/* 'min-h-0' PENTING untuk mencegah flexbox overflow di Chrome */}
      <div className="flex-grow flex flex-col min-h-0">
        
        {/* === Bagian Profil (TETAP) === */}
        {/* 'flex-shrink-0' mencegahnya menyusut */}
        <div className="p-6 text-center border-b border-gray-100 flex-shrink-0">
          <img
            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.full_name}&background=random`}
            alt="Profil"
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-100 object-cover shadow-lg"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = `https://ui-avatars.com/api/?name=${currentUser?.full_name}&background=random`;
            }}
          />
          <h4 className="font-semibold text-gray-800 break-words px-2">
            {currentUser?.full_name}
          </h4>
          <p className="text-sm text-gray-500 capitalize">
            {currentUser?.role_name?.replace('_', ' ') || 'Belum ada role'}
          </p>
        </div>

        {/* === Bagian Navigasi (SCROLLABLE) === */}
        {/* 'flex-grow' membuat nav mengisi sisa ruang */}
        {/* 'overflow-y-auto' adalah kuncinya, membuat HANYA nav ini yang scroll */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              end={link.end} 
            />
          ))}
        </nav>
      </div>

      {/* === Bagian Logout (TETAP) === */}
      {/* 'mt-auto' sudah ada, tapi 'flex-shrink-0' lebih mempertegas */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 p-3 rounded-lg text-red-500 
                     hover:bg-red-50 hover:text-red-600 w-full 
                     transition-all duration-300 ease-in-out transform
                     justify-start hover:translate-x-2"
        >
          <div className="w-6 h-6 flex items-center justify-center"><BsBoxArrowLeft size={20} /></div>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;