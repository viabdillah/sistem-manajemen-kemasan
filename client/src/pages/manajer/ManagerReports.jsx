import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Download, TrendingUp, Package, BrainCircuit, Factory } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../services/supabaseClient';
import { analyzeFinance, analyzeStock } from '../../utils/smartAnalyst';
import ProductionReport from './ProductionReport';

const ManagerReports = () => {
  const [activeTab, setActiveTab] = useState('finance'); // 'finance' | 'stock' | 'production'
  const [isLoading, setIsLoading] = useState(true);
  
  const [financeLogs, setFinanceLogs] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  const [financeAnalysis, setFinanceAnalysis] = useState(null);
  const [stockAnalysis, setStockAnalysis] = useState(null);
  const [chartData, setChartData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [financeRes, invRes] = await Promise.all([
        supabase.from('finance_logs').select('*, transactions(invoice_number, items, customers(name))').order('created_at', { ascending: false }), // Terbaru paling atas
        supabase.from('inventory').select('*').order('name', { ascending: true })
      ]);

      if (financeRes.error) throw financeRes.error;
      if (invRes.error) throw invRes.error;

      setFinanceLogs(financeRes.data);
      setInventory(invRes.data);

      setFinanceAnalysis(analyzeFinance(financeRes.data));
      setStockAnalysis(analyzeStock(invRes.data));

      // Grouping data untuk Chart (Di-reverse agar grafik dari kiri ke kanan berdasarkan waktu)
      const reversedLogs = [...financeRes.data].reverse();
      const groupedFinance = reversedLogs.reduce((acc, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (!acc[date]) acc[date] = { name: date, income: 0, expense: 0 };
        if (curr.type === 'income') acc[date].income += curr.amount;
        else acc[date].expense += curr.amount;
        return acc;
      }, {});
      setChartData(Object.values(groupedFinance));

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading reports:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];

    // Sheet 1: Keuangan
    const financeSheetData = financeLogs.map(log => {
        let detailKeterangan = log.description;
        let detailItem = "-";
        let namaPelanggan = "-";

        if (log.transactions) {
            namaPelanggan = log.transactions.customers?.name || 'Umum';
            const items = log.transactions.items || [];
            detailItem = items.map(i => `${i.productName} (${i.packagingSize}) x${i.qty}`).join(', ');
            detailKeterangan = `Penjualan Inv: ${log.transactions.invoice_number}`;
        }

        return {
            Tanggal: new Date(log.created_at).toLocaleDateString('id-ID'),
            Jam: new Date(log.created_at).toLocaleTimeString('id-ID'),
            Tipe: log.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            Kategori: log.category,
            Nominal: Number(log.amount),
            Metode: log.payment_method || '-',
            Keterangan: detailKeterangan,
            Pelanggan: namaPelanggan,
            Detail_Barang: detailItem
        };
    });
    const wsFinance = XLSX.utils.json_to_sheet(financeSheetData);
    XLSX.utils.book_append_sheet(wb, wsFinance, "Keuangan");

    // Sheet 2: Stok
    const stockSheetData = inventory.map(item => ({
        Nama: item.name,
        Stok: item.stock,
        Satuan: item.unit,
        Status: item.stock <= item.min_stock ? 'KRITIS' : 'AMAN'
    }));
    const wsStock = XLSX.utils.json_to_sheet(stockSheetData);
    XLSX.utils.book_append_sheet(wb, wsStock, "Stok Gudang");

    XLSX.writeFile(wb, `Laporan_Manajerial_${dateStr}.xlsx`);
  };

  if (isLoading) return <div className="p-10 text-center">Mengolah Big Data...</div>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <BrainCircuit className="text-purple-600" size={32}/> Smart Analytics Center
          </h1>
          <p className="text-gray-500">Laporan terintegrasi dengan analisis bisnis otomatis.</p>
        </div>
        
        {activeTab !== 'production' && (
            <button 
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition transform hover:-translate-y-1"
            >
                <Download size={20}/> Download Excel Report
            </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button 
            onClick={() => setActiveTab('finance')}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'finance' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <TrendingUp size={18}/> Laporan Keuangan
        </button>
        <button 
            onClick={() => setActiveTab('stock')}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'stock' ? 'border-b-4 border-purple-600 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Package size={18}/> Audit Stok
        </button>
        <button 
            onClick={() => setActiveTab('production')}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'production' ? 'border-b-4 border-amber-600 text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Factory size={18}/> Laporan Produksi
        </button>
      </div>

      {/* CONTENT AREA */}
      
      {/* 1. KEUANGAN */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fade-in">
            {/* AI INSIGHT */}
            <div className={`p-6 rounded-2xl border-l-8 shadow-sm ${financeAnalysis.status === 'good' ? 'bg-green-50 border-green-500 text-green-900' : financeAnalysis.status === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                <div className="flex items-start gap-3">
                    <BrainCircuit className="shrink-0 mt-1" size={24}/>
                    <div>
                        <h3 className="font-bold text-lg">Analisa Bisnis Cerdas</h3>
                        <p className="mt-1 text-sm md:text-base opacity-90">{financeAnalysis.insight}</p>
                    </div>
                </div>
            </div>

            {/* CHART */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6">Grafik Arus Kas</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                            <Tooltip />
                            <Legend wrapperStyle={{paddingTop: '20px'}}/>
                            <Bar dataKey="income" name="Pemasukan" fill="#3b82f6" radius={[4,4,0,0]} />
                            <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RINGKASAN ANGKA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase">Total Pemasukan</p>
                    <p className="text-2xl font-black text-blue-600">Rp {financeAnalysis.income.toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase">Total Pengeluaran</p>
                    <p className="text-2xl font-black text-red-600">Rp {financeAnalysis.expense.toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase">Profit Bersih</p>
                    <p className={`text-2xl font-black ${financeAnalysis.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rp {financeAnalysis.profit.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* --- TABEL RINCIAN RIWAYAT (BARU DITAMBAHKAN) --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">Rincian Riwayat Transaksi</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 border-b">
                            <tr>
                                <th className="px-6 py-3 font-bold">Tanggal</th>
                                <th className="px-6 py-3 font-bold">Kategori</th>
                                <th className="px-6 py-3 font-bold">Keterangan</th>
                                <th className="px-6 py-3 font-bold text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {financeLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleDateString('id-ID')} <br/>
                                        <span className="text-xs">{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {log.description}
                                        {/* Jika ada relasi transaksi, tampilkan info tambahan */}
                                        {log.transactions && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                Inv: {log.transactions.invoice_number} ({log.transactions.customers?.name})
                                            </div>
                                        )}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${log.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.type === 'income' ? '+' : '-'} Rp {Number(log.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* -------------------------------------------------- */}
        </div>
      )}

      {/* 2. STOK */}
      {activeTab === 'stock' && (
        <div className="space-y-6 animate-fade-in">
            <div className={`p-6 rounded-2xl border-l-8 shadow-sm ${stockAnalysis.status === 'good' ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                <div className="flex items-start gap-3">
                    <BrainCircuit className="shrink-0 mt-1" size={24}/>
                    <div>
                        <h3 className="font-bold text-lg">Analisa Kesehatan Gudang (Skor: {stockAnalysis.healthScore}/100)</h3>
                        <p className="mt-1 text-sm md:text-base opacity-90">{stockAnalysis.insight}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 border-b">
                        <tr>
                            <th className="px-6 py-3 font-bold">Nama Barang</th>
                            <th className="px-6 py-3 font-bold">Kategori</th>
                            <th className="px-6 py-3 font-bold text-center">Stok</th>
                            <th className="px-6 py-3 font-bold text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {inventory.map(item => (
                            <tr key={item.id} className={`hover:bg-gray-50 ${item.stock <= item.min_stock ? 'bg-red-50/30' : ''}`}>
                                <td className="px-6 py-3 font-medium text-gray-800">{item.name}</td>
                                <td className="px-6 py-3 text-gray-500">{item.category}</td>
                                <td className="px-6 py-3 text-center font-bold">{item.stock} {item.unit}</td>
                                <td className="px-6 py-3 text-center">
                                    {item.stock <= item.min_stock ? (
                                        <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-bold">Kritis</span>
                                    ) : (
                                        <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-bold">Aman</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* 3. PRODUKSI */}
      {activeTab === 'production' && (
        <ProductionReport />
      )}

    </div>
  );
};

export default ManagerReports;