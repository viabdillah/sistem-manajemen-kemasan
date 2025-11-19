import { useState, useEffect } from 'react';
import { 
  Users, Database, Server, Shield, Activity, 
  Package, ChevronRight, Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    userCount: 0,
    customerCount: 0,
    packagingCount: 0,
    transactionCount: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // 1. Fetch Counts (Parallel)
        const [users, customers, packs, trans] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('customers').select('*', { count: 'exact', head: true }),
          supabase.from('packaging_types').select('*', { count: 'exact', head: true }),
          supabase.from('transactions').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          userCount: users.count || 0,
          customerCount: customers.count || 0,
          packagingCount: packs.count || 0,
          transactionCount: trans.count || 0
        });

        // 2. Fetch Recent Users
        const { data: recent } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentUsers(recent || []);
        setIsLoading(false);

      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) return <div className="p-10 text-center">Memuat System Control...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Shield size={32} className="text-blue-700"/> Control Panel
            </h1>
            <p className="text-slate-500 mt-1">Selamat datang, Administrator Sistem.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            System Online
        </div>
      </div>

      {/* SYSTEM STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Pengguna" 
            count={stats.userCount} 
            icon={Users} 
            color="bg-blue-600"
            onClick={() => navigate('/users')} // Kita pass fungsi navigasi di sini
        />
        <StatCard 
            title="Master Kemasan" 
            count={stats.packagingCount} 
            icon={Package} 
            color="bg-indigo-600"
            onClick={() => navigate('/packaging-types')}
        />
        <StatCard 
            title="Database Pelanggan" 
            count={stats.customerCount} 
            icon={Database} 
            color="bg-emerald-600"
            onClick={() => navigate('/customers')}
        />
        <StatCard 
            title="Total Transaksi" 
            count={stats.transactionCount} 
            icon={Server} 
            color="bg-slate-600"
            onClick={() => navigate('/history')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT USERS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={18}/> Aktivitas User Terbaru
                </h3>
                <button onClick={() => navigate('/users')} className="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</button>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="px-6 py-3">Nama</th>
                        <th className="px-6 py-3">Username</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Terdaftar</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {recentUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-slate-700">{u.full_name}</td>
                            <td className="px-6 py-3 text-slate-500">{u.username}</td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                    u.role === 'kasir' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-slate-400 text-xs">
                                {new Date(u.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* QUICK SETTINGS CARD */}
        <div className="bg-slate-800 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Settings className="animate-spin-slow"/> System Info
                </h3>
                <div className="space-y-4 text-sm text-slate-300">
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span>Database</span>
                        <span className="font-mono text-white">Supabase (PostgreSQL)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span>Environment</span>
                        <span className="font-mono text-white">Production (Vite)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span>Status API</span>
                        <span className="font-mono text-green-400">Connected</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Version</span>
                        <span className="font-mono text-white">v1.2.0</span>
                    </div>
                </div>
            </div>
            
            <button className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition shadow-lg shadow-blue-900/50">
                Cek Log Sistem
            </button>
        </div>

      </div>

    </div>
  );
};

// --- HELPER COMPONENT: STAT CARD (DIPINDAHKAN KE LUAR) ---
// Perubahan: Menerima 'onClick' sebagai prop, bukan 'link'
const StatCard = ({ title, count, icon, color, onClick }) => {
    const IconComponent = icon; // Assign ke variabel Capitalized agar bisa dirender sebagai komponen

    return (
        <div 
            onClick={onClick}
            className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group ${onClick ? 'cursor-pointer' : ''}`}
        >
        <div className="flex justify-between items-start">
            <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">{count}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color} text-white bg-opacity-90 group-hover:scale-110 transition-transform`}>
            {/* Render variabel baru */}
            <IconComponent size={24} />
            </div>
        </div>
        {onClick && (
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                Kelola Data <ChevronRight size={14}/>
            </div>
        )}
        </div>
    );
};

export default AdminDashboard;