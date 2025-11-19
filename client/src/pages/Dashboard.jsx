import { useState } from 'react'; // Hapus useEffect karena tidak butuh lagi

const Dashboard = () => {
  // --- PERBAIKAN DI SINI ---
  // Langsung baca data saat state dibuat
  const [user] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : { namaLengkap: 'User', role: 'Guest' };
  });
  // -------------------------

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      
      {/* Kartu Selamat Datang */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl shadow-lg p-6 text-white mb-8">
        <h3 className="text-xl font-semibold">Halo, {user.namaLengkap}! 👋</h3>
        <p className="opacity-90 mt-1">
          Anda login sebagai <span className="font-bold uppercase bg-white/20 px-2 py-0.5 rounded">{user.role}</span>.
        </p>
      </div>

      {/* Statistik Mockup Sederhana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Pesanan</p>
          <h4 className="text-2xl font-bold text-gray-800 mt-1">1,240</h4>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Stok Menipis</p>
          <h4 className="text-2xl font-bold text-orange-500 mt-1">5 Item</h4>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Pendapatan Hari Ini</p>
          <h4 className="text-2xl font-bold text-green-600 mt-1">Rp 2.500.000</h4>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;