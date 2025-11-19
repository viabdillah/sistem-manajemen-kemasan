import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Printer, Eye, FileText, 
  CheckCircle, Clock, AlertCircle, XCircle 
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // --- 1. FETCH DATA ---
  const fetchHistory = useCallback(async () => {
    try {
      // Ambil data transaksi + relasi customer
      const { data, error } = await supabase
        .from('transactions')
        .select('*, customers(*)')
        .order('created_at', { ascending: false }); // Terbaru paling atas

      if (error) throw error;
      setTransactions(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Gagal memuat riwayat:', error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // --- 2. FILTERING ---
  const filteredData = transactions.filter(trx => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = trx.customers?.name?.toLowerCase() || '';
    const invoice = trx.invoice_number?.toLowerCase() || '';
    
    const matchSearch = customerName.includes(searchLower) || invoice.includes(searchLower);
    const matchStatus = filterStatus === 'All' || trx.status === filterStatus || trx.order_status === filterStatus;

    return matchSearch && matchStatus;
  });

  // --- HELPER: BADGE WARNA ---
  const getPaymentBadge = (status) => {
    switch (status) {
        case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
        case 'Down Payment': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'Pending': return 'bg-gray-100 text-gray-700 border-gray-200';
        case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProductionBadge = (status) => {
    switch (status) {
        case 'Completed': return 'text-green-600 bg-green-50 border-green-100';
        case 'Ready': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'Processing': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'Rejected': return 'text-red-600 bg-red-50 border-red-100';
        default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-600"/> Riwayat Pesanan
            </h1>
            <p className="text-gray-500 text-sm">Daftar semua transaksi yang pernah dilakukan.</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input 
                type="text" 
                placeholder="Cari No. Invoice atau Nama Pelanggan..." 
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <select 
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="All">Semua Status</option>
                <optgroup label="Status Pembayaran">
                    <option value="Paid">Lunas</option>
                    <option value="Down Payment">DP (Belum Lunas)</option>
                    <option value="Pending">Pending</option>
                </optgroup>
                <optgroup label="Status Produksi">
                    <option value="Completed">Selesai (Diambil)</option>
                    <option value="Ready">Siap Diambil</option>
                    <option value="Processing">Sedang Proses</option>
                    <option value="Queue">Antrian</option>
                </optgroup>
            </select>
        </div>
      </div>

      {/* TABLE / LIST */}
      {isLoading ? (
          <div className="text-center py-10">Memuat riwayat...</div>
      ) : filteredData.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
              Tidak ada data ditemukan.
          </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left hidden md:table">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Pelanggan</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Pembayaran</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Produksi</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.map(trx => (
                        <tr key={trx.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                                <span className="font-mono font-medium text-blue-600">{trx.invoice_number}</span>
                                <div className="text-xs text-gray-400 mt-1">{new Date(trx.created_at).toLocaleDateString('id-ID')}</div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-800">
                                {trx.customers?.name || 'Umum'}
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-700">Rp {trx.total_amount.toLocaleString('id-ID')}</div>
                                {trx.remaining_balance > 0 && (
                                    <div className="text-xs text-red-500 font-medium">Sisa: Rp {trx.remaining_balance.toLocaleString()}</div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPaymentBadge(trx.status)}`}>
                                    {trx.status === 'Down Payment' ? 'DP' : trx.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getProductionBadge(trx.order_status)}`}>
                                    {trx.order_status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => navigate(`/invoice/${trx.id}`)}
                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition"
                                    title="Lihat Nota"
                                >
                                    <Printer size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile View (Card) */}
            <div className="md:hidden p-4 space-y-3">
                {filteredData.map(trx => (
                    <div key={trx.id} className="border rounded-xl p-4 hover:shadow-md transition" onClick={() => navigate(`/invoice/${trx.id}`)}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-bold text-gray-800">{trx.customers?.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{trx.invoice_number}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-blue-600">Rp {trx.total_amount.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">{new Date(trx.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentBadge(trx.status)}`}>
                                {trx.status}
                             </span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getProductionBadge(trx.order_status)}`}>
                                {trx.order_status}
                             </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
};

export default OrderHistory;