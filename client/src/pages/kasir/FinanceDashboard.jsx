import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, Minus, History, ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../services/supabaseClient';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'income', category: 'Operasional', amount: '', description: '', payment_method: 'Cash' });

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('finance_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLogs(data);

      // Hitung Statistik Sederhana (Semua Waktu)
      // Note: Di aplikasi real, sebaiknya filter per hari/bulan
      let inc = 0, exp = 0;
      data.forEach(item => {
        if(item.type === 'income') inc += Number(item.amount);
        else exp += Number(item.amount);
      });

      setStats({ income: inc, expense: exp, balance: inc - exp });
      setIsLoading(false);

    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLER INPUT MANUAL ---
  const openModal = (type) => {
    setFormData({ 
        type: type, 
        category: type === 'income' ? 'Lainnya' : 'Operasional', 
        amount: '', 
        description: '', 
        payment_method: 'Cash' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const { error } = await supabase.from('finance_logs').insert([formData]);
        if (error) throw error;

        setIsModalOpen(false);
        fetchData();
        Swal.fire('Berhasil', 'Data keuangan tercatat.', 'success');
    } catch (error) {
        Swal.fire('Gagal', error.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-blue-600"/> Keuangan Toko
        </h1>
        <button onClick={() => navigate('/finance/history')} className="text-blue-600 font-medium flex items-center gap-1 hover:underline">
            Lihat Semua Riwayat <ArrowRight size={16}/>
        </button>
      </div>

      {/* STATISTIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-2xl text-white shadow-lg">
            <p className="text-blue-100 text-sm font-medium mb-1">Saldo Saat Ini</p>
            <h2 className="text-3xl font-bold">Rp {stats.balance.toLocaleString('id-ID')}</h2>
        </div>
        {/* Pemasukan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Pemasukan</p>
                    <h2 className="text-2xl font-bold text-green-600">Rp {stats.income.toLocaleString('id-ID')}</h2>
                </div>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={24}/></div>
            </div>
        </div>
        {/* Pengeluaran */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Pengeluaran</p>
                    <h2 className="text-2xl font-bold text-red-600">Rp {stats.expense.toLocaleString('id-ID')}</h2>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={24}/></div>
            </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => openModal('income')} className="flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 transition">
            <Plus size={20}/> Input Pemasukan Lain
        </button>
        <button onClick={() => openModal('expense')} className="flex items-center justify-center gap-2 py-4 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 transition">
            <Minus size={20}/> Catat Pengeluaran
        </button>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-700">
            5 Transaksi Terakhir
        </div>
        <div className="divide-y divide-gray-100">
            {isLoading ? <div className="p-6 text-center">Loading...</div> : logs.slice(0, 5).map(log => (
                <div key={log.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${log.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {log.type === 'income' ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{log.category}</p>
                            <p className="text-xs text-gray-500">{log.description || '-'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className={`font-bold ${log.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {log.type === 'income' ? '+' : '-'} Rp {Number(log.amount).toLocaleString('id-ID')}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* MODAL INPUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">
                    {formData.type === 'income' ? 'Tambah Pemasukan' : 'Catat Pengeluaran'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                        <select className="w-full border rounded-lg p-2.5" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {formData.type === 'income' ? (
                                <>
                                    <option value="Penjualan Manual">Penjualan Manual</option>
                                    <option value="Modal Tambahan">Modal Tambahan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </>
                            ) : (
                                <>
                                    <option value="Operasional">Operasional</option>
                                    <option value="Gaji Karyawan">Gaji Karyawan</option>
                                    <option value="Beli Bahan Baku">Beli Bahan Baku</option>
                                    <option value="Listrik & Air">Listrik & Air</option>
                                    <option value="Makan Minum">Makan Minum</option>
                                    <option value="Lainnya">Lainnya</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nominal (Rp)</label>
                        <input type="number" required className="w-full border rounded-lg p-2.5" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Keterangan</label>
                        <input type="text" required className="w-full border rounded-lg p-2.5" placeholder="Cth: Beli Kertas A4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Metode</label>
                        <select className="w-full border rounded-lg p-2.5" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                            <option value="Cash">Tunai (Cash)</option>
                            <option value="Transfer">Transfer</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Batal</button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default FinanceDashboard;