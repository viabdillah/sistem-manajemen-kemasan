import { useState } from 'react';
// Import semua dashboard spesifik
import ManagerDashboard from './manajer/ManagerDashboard';
import ProductionDashboard from './operator/ProductionDashboard';
import AdminDashboard from './admin/AdminDashboard';
import CreateTransaction from './kasir/SelectCustomerForOrder'; 

const Dashboard = () => {
  // REVISI: Baca localStorage langsung di useState (Lazy Init)
  // Ini mencegah error setState di useEffect
  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  if (!user) return null;

  // --- LOGIC PEMILIHAN DASHBOARD ---
  
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user.role === 'manajer') {
    return <ManagerDashboard />;
  }
  
  if (user.role === 'operator' || user.role === 'desainer') {
    if(user.role === 'operator') return <ProductionDashboard />;
    
    return <div className="p-10 text-center text-gray-500">Selamat datang, Desainer. Silakan akses menu Tugas Desainer.</div>;
  }

  if (user.role === 'kasir') {
    return <div className="p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Halo, {user.namaLengkap} 👋</h1>
        <p className="text-gray-500 mb-8">Selamat bertugas. Silakan pilih menu di samping.</p>
        
        {/* Shortcut Cepat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/transactions/create" className="bg-blue-600 text-white p-6 rounded-xl shadow hover:bg-blue-700 transition text-center font-bold">
                Buat Pesanan Baru
            </a>
            <a href="/customers" className="bg-white border p-6 rounded-xl shadow-sm hover:bg-gray-50 transition text-center font-bold text-gray-700">
                Cek Pelanggan
            </a>
        </div>
    </div>;
  }

  return <div className="p-10">Role tidak dikenali.</div>;
};

export default Dashboard;