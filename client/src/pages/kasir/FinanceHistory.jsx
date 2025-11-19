import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const FinanceHistory = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from('finance_logs')
        .select('*')
        .order('created_at', { ascending: false });
      setLogs(data || []);
    };
    fetchAll();
  }, []);

  const filteredLogs = logs.filter(log => filterType === 'All' || log.type === filterType);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/finance')}><ArrowLeft/></button>
        <h1 className="text-2xl font-bold">Riwayat Arus Kas</h1>
      </div>

      <div className="flex gap-2 mb-4">
        {['All', 'income', 'expense'].map(type => (
            <button 
                key={type} 
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full capitalize border ${filterType === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
                {type === 'All' ? 'Semua' : type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Keterangan</th>
                    <th className="p-4 text-right">Jumlah</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="p-4 font-medium">{log.category}</td>
                        <td className="p-4 text-gray-600">{log.description} <span className="text-xs bg-gray-100 px-1 rounded">{log.payment_method}</span></td>
                        <td className={`p-4 text-right font-bold ${log.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {log.type === 'income' ? '+' : '-'} Rp {Number(log.amount).toLocaleString()}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceHistory;