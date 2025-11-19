import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, Users, Package, DollarSign, 
  Activity, Calendar, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    pendingProduction: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [recentTrx, setRecentTrx] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Ambil Semua Transaksi
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*, customers(name)')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // --- PENGOLAHAN DATA (ANALYTICS) ---

      // A. KPI Utama
      const totalRevenue = transactions.reduce((sum, t) => sum + t.total_amount, 0);
      const totalOrders = transactions.length;
      const pendingProduction = transactions.filter(t => ['Queue', 'Designing', 'Production', 'Processing'].includes(t.order_status)).length;
      
      // Hitung Customer Unik
      const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;

      setStats({
        totalRevenue,
        totalOrders,
        activeCustomers: uniqueCustomers,
        pendingProduction
      });

      // B. Data Grafik Area (Pendapatan per Hari - 7 Hari Terakhir)
      // Simplifikasi: Mengelompokkan data berdasarkan tanggal
      const groupedByDate = transactions.reduce((acc, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (!acc[date]) acc[date] = 0;
        acc[date] += curr.total_amount;
        return acc;
      }, {});

      const chartData = Object.keys(groupedByDate).map(date => ({
        name: date,
        total: groupedByDate[date]
      })).slice(-7); // Ambil 7 hari terakhir
      setRevenueData(chartData);

      // C. Data Pie Chart (Distribusi Status Pesanan)
      const statusCounts = transactions.reduce((acc, curr) => {
        const status = curr.order_status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const pieData = [
        { name: 'Selesai', value: statusCounts['Completed'] || 0, color: '#10b981' }, // Green
        { name: 'Proses', value: (statusCounts['Processing'] || 0) + (statusCounts['Production'] || 0), color: '#f59e0b' }, // Amber
        { name: 'Desain', value: statusCounts['Designing'] || 0, color: '#6366f1' }, // Indigo
        { name: 'Antrian', value: statusCounts['Queue'] || 0, color: '#ef4444' }, // Red
      ].filter(item => item.value > 0);
      setStatusData(pieData);

      // D. Transaksi Terbaru (5 Terakhir)
      setRecentTrx(transactions.reverse().slice(0, 5));

      setIsLoading(false);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setIsLoading(false);
    }
  };

  // Komponen Kartu KPI Kecil
  const KpiCard = ({ title, value, icon, color, trend }) => {
    const IconComponent = icon; // Assign ke variabel Capitalized

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
            <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-blue-100`}>
            <IconComponent size={20} />
            </div>
        </div>
        <div className="mt-4 flex items-center text-xs font-medium text-green-500">
            <ArrowUpRight size={14} className="mr-1"/>
            <span>{trend} vs bulan lalu</span>
        </div>
        </div>
    );
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500">Menganalisis Data Bisnis...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Executive Overview</h1>
          <p className="text-gray-500 mt-1">Analisis performa bisnis & produksi terkini.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm text-sm text-gray-600">
            <Calendar size={16}/> {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- BENTO GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(140px,auto)]">
        
        {/* 1. KPI CARDS (Baris Atas) */}
        <KpiCard 
            title="Total Pendapatan" 
            value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`} 
            icon={DollarSign} 
            color="bg-blue-600"
            trend="+12.5%"
        />
        <KpiCard 
            title="Total Pesanan" 
            value={stats.totalOrders} 
            icon={Package} 
            color="bg-indigo-600"
            trend="+5.2%"
        />
        <KpiCard 
            title="Pelanggan Aktif" 
            value={stats.activeCustomers} 
            icon={Users} 
            color="bg-purple-600"
            trend="+8.1%"
        />
        <KpiCard 
            title="Antrian Produksi" 
            value={stats.pendingProduction} 
            icon={Activity} 
            color="bg-amber-500"
            trend="Stabil"
        />

        {/* 2. GRAFIK PENDAPATAN (Besar - Col Span 2, Row Span 2) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm md:col-span-2 lg:col-span-3 row-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Tren Pendapatan (7 Hari Terakhir)</h3>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10}/>
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `Rp${value/1000}k`}/>
                        <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                            formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']}
                        />
                        <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 3. STATUS ORDER (Donut Chart - Col Span 1, Row Span 2) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm md:col-span-2 lg:col-span-1 row-span-2 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Status Pesanan</h3>
            <div className="flex-1 flex justify-center items-center relative">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={statusData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-gray-800">{stats.totalOrders}</span>
                    <span className="text-xs text-gray-400 uppercase font-bold">Total</span>
                </div>
            </div>
            {/* Legend */}
            <div className="space-y-2 mt-4">
                {statusData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* 4. TRANSAKSI TERBARU (Wide - Col Span 4) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm md:col-span-2 lg:col-span-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Transaksi Terbaru</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">Lihat Semua</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-semibold">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Pelanggan</th>
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Tanggal</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center rounded-r-lg">Produksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {recentTrx.map((trx) => (
                            <tr key={trx.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-4 py-3 font-bold text-gray-800">{trx.customers?.name}</td>
                                <td className="px-4 py-3 font-mono text-gray-500 text-xs">{trx.invoice_number}</td>
                                <td className="px-4 py-3 text-gray-500">{new Date(trx.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-bold text-blue-600">Rp {trx.total_amount.toLocaleString()}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${trx.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {trx.status === 'Down Payment' ? 'DP' : trx.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                     <span className="text-xs font-medium text-gray-500 border border-gray-200 px-2 py-1 rounded">
                                        {trx.order_status}
                                     </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;