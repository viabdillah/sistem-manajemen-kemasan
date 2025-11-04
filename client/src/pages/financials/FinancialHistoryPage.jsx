// client/src/pages/financials/FinancialHistoryPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { BsPlusCircleFill, BsSearch, BsDownload, BsFilter } from 'react-icons/bs';
import AddTransactionModal from '../../components/financials/AddTransactionModal.jsx';
import { exportToExcel } from '../../utils/excelExporter.js';

// --- Impor Chart.js (tetap Line Chart) ---
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_URL = import.meta.env.VITE_API_BASE_URL;

// ... (Komponen SummaryCard tetap sama)
const SummaryCard = ({ title, amount, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg ${colorClass}`}>
    <p className="text-sm font-medium opacity-80">{title}</p>
    <p className="text-3xl font-bold mt-2">
      Rp {Number(amount).toLocaleString('id-ID')}
    </p>
  </div>
);

const FinancialHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // --- REVISI: 'fetchTableData' ---
  const fetchTableData = useCallback(async () => {
    setLoadingTable(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/api/keuangan/transactions`, { // <-- fetch() bisa menangani path relatif
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data keuangan');
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingTable(false);
    }
  }, [getAuthToken]);

  // --- REVISI: 'fetchChartData' ---
  const fetchChartData = useCallback(async (start, end) => {
    setLoadingChart(true);
    try {
      const token = await getAuthToken();
      
      // --- PERBAIKAN: Buat string URL secara manual ---
      let urlString = `${API_URL}/api/keuangan/charts/sales`;
      if (start && end) {
        urlString += `?startDate=${start}&endDate=${end}`;
      }
      // --- AKHIR PERBAIKAN ---

      const response = await fetch(urlString, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data chart');
      const chartRawData = await response.json();

      // ... (sisa logika format chart)
      const labels = chartRawData.map(d => new Date(d.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
      const pemasukanData = chartRawData.map(d => d.total_pemasukan);
      const pengeluaranData = chartRawData.map(d => d.total_pengeluaran);
      setChartData({
        labels,
        datasets: [
          { label: 'Pemasukan (Rp)', data: pemasukanData, fill: true, backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 1)', tension: 0.3 },
          { label: 'Pengeluaran (Rp)', data: pengeluaranData, fill: true, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 1)', tension: 0.3 },
        ],
      });
    } catch (err) {
      toast.error(err.message);
      setChartData(null);
    } finally {
      setLoadingChart(false);
    }
  }, [getAuthToken]);
  
  useEffect(() => {
    fetchTableData();
    fetchChartData(null, null);
  }, [fetchTableData, fetchChartData]);

  // ... (useEffect pencarian) ...
  useEffect(() => {
    const results = transactions.filter(t =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recorded_by.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(results);
  }, [searchTerm, transactions]);
  
  // ... (useMemo summaryData) ...
  const summaryData = useMemo(() => {
     const pemasukan = transactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + Number(t.amount), 0);
     const pengeluaran = transactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0);
     const saldo = pemasukan - pengeluaran;
     return { pemasukan, pengeluaran, saldo };
  }, [transactions]);

  // ... (handleSaveSuccess) ...
  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    fetchTableData(); 
  };
  
  // --- REVISI: 'handleExport' ---
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
      
      // --- PERBAIKAN: Buat string URL secara manual ---
      let urlString = `${API_URL}/api/manager/reports/financials/export?startDate=${startDate}&endDate=${endDate}`;
      // --- AKHIR PERBAIKAN ---

      const response = await fetch(urlString, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal mengambil data ekspor');
      if (data.length === 0) {
        toast.error('Tidak ada data di rentang waktu tersebut.', { id: toastId });
        return;
      }
      
      const dataToExport = data.map(t => ({
        "Tanggal": new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }),
        "Jenis": t.type,
        "Keterangan": t.description,
        "No Pesanan": t.order_number || '-',
        "Dicatat Oleh": t.recorded_by,
        "Jumlah (Rp)": t.amount
      }));
      exportToExcel(dataToExport, "Laporan_Keuangan");
      toast.success('Ekspor berhasil!', { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };
  
  // ... (handleDownloadChart) ...
  const handleDownloadChart = () => {
    if (chartRef.current) {
      const dataUrl = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'chart_pemasukan.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Chart belum siap untuk diunduh.');
    }
  };

  // ... (handleFilterChart) ...
  const handleFilterChart = () => {
    if (!startDate || !endDate) {
      toast.error('Silakan pilih rentang waktu (Mulai dan Akhir) untuk memfilter chart.');
      return;
    }
    fetchChartData(startDate, endDate);
  };

  if (loadingTable) return <div className="p-4">Loading data...</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      {/* ... (Header Halaman) ... */}
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Riwayat Keuangan</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg"
        >
          <BsPlusCircleFill /> Catat Transaksi
        </button>
      </div>

      {/* ... (Ringkasan Status & Chart) ... */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 grid grid-cols-1 gap-6">
          <SummaryCard title="Total Pemasukan" amount={summaryData.pemasukan} colorClass="bg-green-100 text-green-800" />
          <SummaryCard title="Total Pengeluaran" amount={summaryData.pengeluaran} colorClass="bg-red-100 text-red-800" />
          <SummaryCard title="Saldo Saat Ini" amount={summaryData.saldo} colorClass="bg-blue-100 text-blue-800" />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Tren Keuangan</h2>
            <button
              onClick={handleDownloadChart}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="Download Chart sebagai PNG"
            >
              <BsDownload size={18} />
            </button>
          </div>
          <div className="h-64">
            {loadingChart ? (
              <p className="text-gray-500">Memuat chart...</p>
            ) : chartData ? (
              <Line 
                ref={chartRef}
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                  scales: { y: { ticks: { callback: (value) => `Rp ${value/1000}k` } } }
                }} 
              />
            ) : (
              <p className="text-red-500">Gagal memuat data chart.</p>
            )}
          </div>
        </div>
      </div>

      {/* ... (Bilah Pencarian dan Filter) ... */}
       <div className="bg-white p-4 rounded-xl shadow-lg space-y-4">
         <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><BsSearch size={18} /></span>
            <input
              type="text"
              placeholder="Cari (Keterangan, Pencatat)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 w-full md:w-80 bg-gray-100 rounded-lg"
            />
          </div>
          {currentUser?.role_name === 'manajer' && (
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <span className="text-gray-600">s.d.</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button onClick={handleFilterChart} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
                <BsFilter /> Terapkan Chart
              </button>
              <button onClick={handleExport} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
                <BsDownload /> Export Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ... (Tabel Riwayat Keuangan) ... */}
       <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dicatat Oleh</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {t.type === 'pemasukan' ? (
                      <span className="font-medium text-green-600 capitalize">Pemasukan</span>
                    ) : (
                      <span className="font-medium text-red-600 capitalize">Pengeluaran</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {t.order_id ? (
                      <span>Pemasukan dari <span className="font-semibold text-blue-600">{t.order_number}</span></span>
                    ) : (
                      t.description
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.recorded_by}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${t.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                    Rp {Number(t.amount).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* ... (Modal Entri Manual) ... */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default FinancialHistoryPage;