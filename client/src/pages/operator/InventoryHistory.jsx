import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, ArrowUpCircle, ArrowDownCircle, 
  Calendar, Package, ArrowLeft, Filter 
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const InventoryHistory = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'in', 'out'

  // --- FETCH DATA ---
  const fetchLogs = useCallback(async () => {
    try {
      // Join tabel inventory_logs dengan tabel inventory untuk dapat Nama Barang
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*, inventory(name, unit, category)')
        .order('created_at', { ascending: false }); // Terbaru paling atas

      if (error) throw error;
      setLogs(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // --- FILTER LOGIC ---
  const filteredLogs = logs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  // --- HELPER UI ---
  const getTypeBadge = (type) => {
    if (type === 'in') {
        return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold"><ArrowUpCircle size={14}/> Masuk</span>;
    }
    return <span className="flex items-center gap-1 text-orange-600 bg-orange-100 px-2 py-1 rounded text-xs font-bold"><ArrowDownCircle size={14}/> Keluar</span>;
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      
      {/* HEADER & NAVIGASI */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/inventory')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft size={20} className="text-gray-600"/>
        </button>
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <History className="text-purple-600"/> Riwayat Inventaris
            </h1>
            <p className="text-gray-500 text-sm">Log aktivitas masuk dan keluar barang.</p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
         <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filterType === 'all' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
         >
            Semua
         </button>
         <button 
            onClick={() => setFilterType('in')}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-1 ${filterType === 'in' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
         >
            <ArrowUpCircle size={16}/> Masuk
         </button>
         <button 
            onClick={() => setFilterType('out')}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-1 ${filterType === 'out' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
         >
            <ArrowDownCircle size={16}/> Keluar
         </button>
      </div>

      {/* CONTENT LIST */}
      {isLoading ? (
          <div className="text-center py-10 text-gray-500">Memuat riwayat...</div>
      ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-400">
              Belum ada riwayat aktivitas.
          </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* DESKTOP TABLE */}
            <table className="w-full text-left hidden md:table">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Barang</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aktivitas</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14}/>
                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-800">{log.inventory?.name}</div>
                                <div className="text-xs text-gray-400 uppercase">{log.inventory?.category}</div>
                            </td>
                            <td className="px-6 py-4">
                                {getTypeBadge(log.type)}
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-mono font-bold text-gray-700 text-lg">
                                    {log.amount}
                                </span> 
                                <span className="text-xs text-gray-500 ml-1">{log.inventory?.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 italic">
                                "{log.notes || '-'}"
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MOBILE LIST */}
            <div className="md:hidden divide-y divide-gray-100">
                {filteredLogs.map(log => (
                    <div key={log.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <Clock size={12}/> {new Date(log.created_at).toLocaleString('id-ID')}
                                </p>
                                <h4 className="font-bold text-gray-800 text-lg">{log.inventory?.name}</h4>
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{log.inventory?.category}</span>
                            </div>
                            <div className="text-right">
                                {getTypeBadge(log.type)}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 bg-gray-50 p-3 rounded-lg">
                            <div>
                                <span className="text-xs text-gray-500 block">Jumlah</span>
                                <span className="font-bold text-gray-800 text-lg">{log.amount} {log.inventory?.unit}</span>
                            </div>
                            <div className="text-right max-w-[50%]">
                                <span className="text-xs text-gray-500 block">Note</span>
                                <p className="text-sm text-gray-700 italic truncate">{log.notes || '-'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
      )}
    </div>
  );
};

export default InventoryHistory;