import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { Download, Printer, Layers, Package } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../services/supabaseClient';

const ProductionReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [materialStats, setMaterialStats] = useState([]);
  const [productionTrend, setProductionTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*, customers(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTransactions(data);
        processAnalytics(data);
        setIsLoading(false);

      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processAnalytics = (data) => {
    const matMap = {};
    data.forEach(trx => {
        const materials = trx.materials_used || [];
        materials.forEach(m => {
            if (!matMap[m.name]) matMap[m.name] = { name: m.name, total: 0, unit: m.unit };
            matMap[m.name].total += Number(m.amount);
        });
    });
    setMaterialStats(Object.values(matMap).sort((a, b) => b.total - a.total).slice(0, 10));

    const trendMap = {};
    const sortedData = [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    sortedData.forEach(trx => {
        const date = new Date(trx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (!trendMap[date]) trendMap[date] = { date, jumlah_pesanan: 0, item_terproduksi: 0 };
        trendMap[date].jumlah_pesanan += 1;
        trendMap[date].item_terproduksi += trx.items.reduce((sum, i) => sum + i.qty, 0);
    });
    setProductionTrend(Object.values(trendMap));
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const productionSheet = transactions.map(t => {
        const materialsStr = t.materials_used && t.materials_used.length > 0 
            ? t.materials_used.map(m => `${m.name}: ${m.amount}${m.unit}`).join(', ')
            : '-';
        const itemsStr = t.items.map(i => `${i.productName} [${i.packagingSize}] x${i.qty}`).join('; ');

        return {
            Tanggal: new Date(t.created_at).toLocaleDateString(),
            Invoice: t.invoice_number,
            Pelanggan: t.customers?.name || 'Umum',
            Detail_Produk: itemsStr,
            Bahan: materialsStr,
            Status: t.order_status
        };
    });
    const wsProd = XLSX.utils.json_to_sheet(productionSheet);
    XLSX.utils.book_append_sheet(wb, wsProd, "Log Produksi");

    const wsMat = XLSX.utils.json_to_sheet(materialStats);
    XLSX.utils.book_append_sheet(wb, wsMat, "Total Bahan");

    XLSX.writeFile(wb, `Laporan_Produksi_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading) return <div className="p-10 text-center">Memuat data produksi...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* TOMBOL AKSI (KHUSUS TAB INI) */}
      <div className="flex justify-end gap-2">
            <button onClick={() => window.print()} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm">
                <Printer size={16}/> Print
            </button>
            <button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-bold shadow flex items-center gap-2 text-sm">
                <Download size={16}/> Export Excel
            </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Layers size={20} className="text-blue-500"/> Top Pemakaian Bahan
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={materialStats} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}}/>
                        <Tooltip cursor={{fill: '#f9fafb'}} />
                        <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Jumlah Terpakai"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package size={20} className="text-amber-500"/> Tren Output Produksi
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productionTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="item_terproduksi" name="Item Selesai" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="jumlah_pesanan" name="Jml Invoice" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Rincian Log Produksi</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-500 border-b">
                    <tr>
                        <th className="px-6 py-3 font-bold">Info Pesanan</th>
                        <th className="px-6 py-3 font-bold">Detail Item</th>
                        <th className="px-6 py-3 font-bold">Bahan Digunakan</th>
                        <th className="px-6 py-3 font-bold text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {transactions.map(trx => (
                        <tr key={trx.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap align-top">
                                <div className="font-mono font-bold text-blue-600 mb-1">{trx.invoice_number}</div>
                                <div className="font-bold text-gray-800">{trx.customers?.name}</div>
                                <div className="text-xs text-gray-400 mt-1">{new Date(trx.created_at).toLocaleDateString('id-ID')}</div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                {trx.items.map((item, i) => (
                                    <div key={i} className="mb-2 text-xs border-b border-dashed border-gray-200 pb-1 last:border-0">
                                        <span className="font-bold block text-gray-700">{item.productName}</span>
                                        <span className="text-gray-500">{item.packagingType} - {item.packagingSize}</span>
                                        <span className="ml-2 font-bold bg-gray-100 px-1 rounded">x{item.qty}</span>
                                    </div>
                                ))}
                            </td>
                            <td className="px-6 py-4 align-top">
                                {trx.materials_used && trx.materials_used.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {trx.materials_used.map((m, i) => (
                                            <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap">
                                                {m.name}: {m.amount} {m.unit}
                                            </span>
                                        ))}
                                    </div>
                                ) : <span className="text-gray-400 italic text-xs">-</span>}
                            </td>
                            <td className="px-6 py-4 text-center align-top">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${trx.order_status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}`}>
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
  );
};

export default ProductionReport;