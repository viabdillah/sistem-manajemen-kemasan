// client/src/pages/inventory/MaterialHistoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { BsSearch, BsDownload } from 'react-icons/bs';
import { exportToExcel } from '../../utils/excelExporter.js';

// --- Impor Chart.js (tetap ada) ---
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

const MaterialHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [barChartData, setBarChartData] = useState(null);
  const chartRef = React.useRef(null); // Pastikan React.useRef

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // 2. Perbarui 'fetchData'
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Perbarui fetch riwayat
      const historyRes = fetch(`${API_URL}/api/inventory/history`, { headers });
      // Perbarui fetch chart
      const chartRes = fetch(`${API_URL}/api/manager/charts/material-usage`, { headers });

      const [historyResponse, chartResponse] = await Promise.all([historyRes, chartRes]);

      if (!historyResponse.ok) throw new Error('Gagal mengambil riwayat bahan');
      const historyData = await historyResponse.json();
      setHistory(historyData);
      setFilteredHistory(historyData);

      if (chartResponse.ok) {
        const chartRawData = await chartResponse.json();
        const labels = chartRawData.map(d => d.name);
        const data = chartRawData.map(d => d.total_used);
        
        setBarChartData({
          labels,
          datasets: [{
            label: 'Total Terpakai',
            data,
            backgroundColor: 'rgba(99, 102, 241, 0.7)', // indigo-500
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
          }],
        });
      } else {
        throw new Error('Gagal mengambil data chart bahan');
      }

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]); // Hapus API_URL dari dependensi

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // useEffect pencarian (tidak berubah)
  useEffect(() => {
    const results = history.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.order_number && item.order_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredHistory(results);
  }, [searchTerm, history]);

  // 3. Perbarui 'handleExport'
  const handleExport = async () => {
    if (currentUser?.role_name !== 'manajer') {
      toast.error('Hanya Manajer yang dapat mengekspor laporan.');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Silakan pilih rentang waktu (Tanggal Mulai dan Tanggal Akhir) terlebih dahulu.');
      return;
    }
    
    const toastId = toast.loading('Mengambil data untuk ekspor...');
    try {
      const token = await getAuthToken();
      // Perbarui panggilan fetch
      const url = new URL(`${API_URL}/api/manager/reports/inventory/export`);
      url.searchParams.append('startDate', startDate);
      url.searchParams.append('endDate', endDate);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal mengambil data ekspor');
      if (data.length === 0) {
        toast.error('Tidak ada data di rentang waktu tersebut.', { id: toastId });
        return;
      }
      
      const dataToExport = data.map(item => ({
        "Tanggal": new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }),
        "Jenis Transaksi": item.type,
        "Nama Bahan": item.name,
        "Jenis Bahan": item.material_type,
        "Ukuran": item.size,
        "Jumlah": item.type === 'pemasukan' ? item.quantity : -item.quantity,
        "Satuan": item.unit,
        "Keterangan": item.order_number ? `Pesanan ${item.order_number}` : item.description,
        "Dicatat Oleh": item.recorded_by,
      }));

      exportToExcel(dataToExport, "Laporan_Riwayat_Bahan");
      toast.success('Ekspor berhasil!', { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  // Fungsi download chart (tidak berubah)
  const handleDownloadChart = () => {
    if (chartRef.current) {
      const dataUrl = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'chart_bahan_terpakai.png';
      link.click();
      link.remove();
    } else {
      toast.error('Chart belum siap untuk diunduh.');
    }
  };

  if (loading) return <div className="p-4">Loading data...</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Riwayat Bahan</h1>
      
      {/* Area Chart (tidak berubah) */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Top 5 Bahan Terpakai (Pengeluaran)</h2>
          <button
            onClick={handleDownloadChart}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Download Chart sebagai PNG"
          >
            <BsDownload size={18} />
          </button>
        </div>
        <div className="h-64">
          {barChartData ? (
            <Bar
              ref={chartRef}
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          ) : (
            <p className="text-gray-500">Memuat data chart...</p>
          )}
        </div>
      </div>
      
      {/* Bilah Pencarian dan Filter (tidak berubah) */}
      <div className="bg-white p-4 rounded-xl shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><BsSearch size={18} /></span>
            <input
              type="text"
              placeholder="Cari (Bahan, Keterangan, No. Pesanan)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full md:w-96 bg-gray-100 rounded-lg"
            />
          </div>
          {currentUser?.role_name === 'manajer' && (
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <span className="text-gray-600">s.d.</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button onClick={handleExport} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
                <BsDownload /> Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabel Riwayat Bahan (tidak berubah) */}
      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Bahan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dicatat Oleh</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name} ({item.material_type || 'N/A'} - {item.size || 'N/A'})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.type === 'pemasukan' ? (
                    <span className="font-medium text-green-600 capitalize">Pemasukan</span>
                  ) : (
                    <span className="font-medium text-red-600 capitalize">Pengeluaran</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {item.order_id ? (
                    <span>Pengurangan stok untuk <span className="font-semibold text-blue-600">{item.order_number}</span></span>
                  ) : (
                    item.description
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.recorded_by}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${item.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                  {item.type === 'pemasukan' ? '+' : '-'}{item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialHistoryPage;