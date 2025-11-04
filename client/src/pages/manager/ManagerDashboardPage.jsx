// client/src/pages/manager/ManagerDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import { BsArrowUpRight, BsArrowDownRight, BsClockHistory, BsBoxSeam, BsCheckCircle } from 'react-icons/bs';

// --- Impor Chart.js (tetap sama) ---
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Komponen StatCard (tidak berubah)
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg ${colorClass}`}>
    <div className="flex items-center justify-between"><p className="text-sm font-medium opacity-80">{title}</p><div className="text-3xl opacity-70">{icon}</div></div>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

// Helper formatCurrency (tidak berubah)
const formatCurrency = (number) => new Number(number).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

const ManagerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // 2. Perbarui 'fetchAllData'
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const token = await getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };

        // 2a. Perbarui fetch Statistik
        const statsRes = fetch(`${API_URL}/api/manager/dashboard-stats`, { headers });
        // 2b. Perbarui fetch Chart
        const chartRes = fetch(`${API_URL}/api/manager/charts/sales`, { headers });

        const [statsResponse, chartResponse] = await Promise.all([statsRes, chartRes]);

        if (!statsResponse.ok) throw new Error('Gagal mengambil statistik');
        const statsData = await statsResponse.json();
        setStats(statsData);

        if (!chartResponse.ok) throw new Error('Gagal mengambil data chart');
        const chartRawData = await chartResponse.json();
        
        const labels = chartRawData.map(d => new Date(d.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
        const data = chartRawData.map(d => d.total);
        
        setChartData({
          labels,
          datasets: [
            {
              label: 'Pemasukan (Rp)',
              data,
              fill: true,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: 'rgba(59, 130, 246, 1)',
              tension: 0.3,
            },
          ],
        });

      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [getAuthToken]); // Hapus API_URL dari dependensi

  if (loading) return <div className="p-6">Memuat statistik...</div>;
  if (!stats) return <div className="p-6 text-red-500">Gagal memuat data.</div>;

  const totalSaldo = stats.total_pemasukan - stats.total_pengeluaran;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Manajer</h1>
      
      {/* Kartu Ringkasan (tidak berubah) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Saldo" value={formatCurrency(totalSaldo)} icon={<BsArrowUpRight />} colorClass="bg-blue-600 text-white" />
        <StatCard title="Total Pemasukan" value={formatCurrency(stats.total_pemasukan)} icon={<BsArrowUpRight />} colorClass="bg-green-100 text-green-800" />
        <StatCard title="Total Pengeluaran (Operasional)" value={formatCurrency(stats.total_pengeluaran)} icon={<BsArrowDownRight />} colorClass="bg-red-100 text-red-800" />
        <StatCard title="Pesanan Aktif (Desain/Produksi)" value={stats.pesanan_aktif} icon={<BsClockHistory />} colorClass="bg-yellow-100 text-yellow-800" />
        <StatCard title="Pesanan Selesai" value={stats.pesanan_selesai} icon={<BsCheckCircle />} colorClass="bg-gray-100 text-gray-800" />
        <StatCard title="Estimasi Biaya Bahan" value={formatCurrency(stats.total_biaya_bahan)} icon={<BsBoxSeam />} colorClass="bg-indigo-100 text-indigo-800" />
      </div>
      
      {/* Area Chart (tidak berubah) */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pemasukan 30 Hari Terakhir</h2>
        {chartData ? (
          <div className="h-64">
            <Line 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }} 
            />
          </div>
        ) : (
          <p>Memuat data chart...</p>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboardPage;