import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, Clock, Palette, Eye, Sparkles, 
  Layers, History, XCircle, RotateCcw, AlertTriangle, 
  X, ExternalLink, Info, Image, Barcode, Package
} from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../services/supabaseClient';

// --- Komponen Modal Detail Pesanan ---
const OrderDetailModal = ({ order, onClose, isOpen }) => {
  // FIX: Cek isOpen. Jika false, jangan tampilkan apa-apa.
  if (!isOpen || !order) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
        onClick={onClose} 
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform animate-slide-up relative"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-5 flex justify-between items-center text-white">
          <h3 className="font-extrabold text-2xl tracking-tight flex items-center gap-3">
            <Eye size={24}/> Detail Pesanan
          </h3>
          <button onClick={onClose} className="text-white hover:text-blue-200 transition bg-white/20 rounded-full p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Header Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase">Pelanggan</p>
              <h4 className="text-xl font-bold text-blue-900">{order.customers?.name || 'N/A'}</h4>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-blue-700 uppercase">Invoice</p>
              <p className="text-lg font-mono text-blue-800">{order.invoice_number}</p>
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-4">
            <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
              <Package size={20}/> Item Pesanan
            </h5>
            {order.items.map((item, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                
                {/* Baris 1: Nama & Status Desain */}
                <div className="flex justify-between items-start mb-3 border-b pb-3 border-gray-100">
                  <div>
                    <p className="font-extrabold text-xl text-gray-900">{item.productName}</p>
                    {/* --- TAMBAHAN UKURAN & JUMLAH --- */}
                    <div className="flex gap-3 mt-1 text-sm font-medium text-gray-700">
                         <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {item.packagingType}
                         </span>
                         <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            Size: {item.packagingSize}
                         </span>
                         <span className="bg-gray-800 text-white px-2 py-0.5 rounded">
                            Qty: {item.qty}
                         </span>
                    </div>
                    {/* -------------------------------- */}
                  </div>
                  
                  {item.hasDesign ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-200/50 px-2.5 py-1 rounded-full border border-green-300">
                      <CheckCircle size={12}/> Desain Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-200/50 px-2.5 py-1 rounded-full border border-orange-300 animate-pulse">
                      <Palette size={12}/> Desain Baru
                    </span>
                  )}
                </div>

                {/* Baris 2: Detail Produk (Label, NIB, dll) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mt-4">
                  {/* PERBAIKAN LOGIKA PEMANGGILAN DATA (Fallback ke snake_case jika camelCase kosong) */}
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-blue-500"/>
                    <span className="font-medium">Label:</span> {item.productLabel || item.product_label || '-'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Barcode size={16} className="text-purple-500"/>
                    <span className="font-medium">NIB:</span> {item.nib || '-'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Barcode size={16} className="text-purple-500"/>
                    <span className="font-medium">No. PIRT:</span> {item.noPirt || item.no_pirt || '-'}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500"/>
                    <span className="font-medium">Halal:</span> {item.noHalal || item.no_halal || '-'}
                  </div>
                  
                  {item.note && (
                    <div className="md:col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 italic flex items-start gap-2 mt-2">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0"/>
                        <span>Note Kasir: "{item.note}"</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-right text-sm text-gray-500 pt-4 border-t border-gray-100">
            Dibuat pada: {new Date(order.created_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};


const DesignerDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); 
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- 1. EVENT LISTENER MOUSE ---
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const backgroundStyle = {
    background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    backgroundSize: '400% 400%',
    animation: 'gradient 20s ease infinite',
  };

  // --- 2. FETCH DATA ---
  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, customers(*)') 
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // --- 3. UPDATE STATUS ---
  const updateStatus = async (id, newStatus) => {
    try {
        const { error } = await supabase
            .from('transactions')
            .update({ order_status: newStatus }) 
            .eq('id', id);

        if (error) throw error;

        fetchTransactions(); 
        
        const title = newStatus === 'Rejected' ? 'Pesanan Ditolak' : 
                      newStatus === 'Queue' ? 'Dikembalikan ke Antrian' : 'Status Diperbarui';
        
        const icon = newStatus === 'Rejected' ? 'error' : 'success';

        Swal.fire({
            title: title,
            text: `Status pesanan sekarang: ${newStatus}`,
            icon: icon,
            confirmButtonColor: '#3b82f6'
        });
    } catch (error) {
        console.error('Gagal update status:', error.message);
        Swal.fire('Error', 'Gagal update status', 'error');
    }
  };

  // --- HANDLERS ---
  
  // Membuka Modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // 1. Konfirmasi dari Queue
  const handleConfirmOrder = (trx) => {
    const needsDesign = trx.items.some(item => item.hasDesign === false);
    
    Swal.fire({
        title: 'Tinjau Pesanan',
        html: needsDesign 
            ? `<div class="text-orange-600 font-bold mb-2">⚠️ Butuh Desain Baru</div> Masuk ke tab Proses Desain?` 
            : `<div class="text-green-600 font-bold mb-2">✅ Desain Ready</div> Langsung kirim ke Produksi?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Proses',
        cancelButtonText: 'Tolak Pesanan',
    }).then((result) => {
        if (result.isConfirmed) {
            const nextStatus = needsDesign ? 'Designing' : 'Production';
            updateStatus(trx.id, nextStatus);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            updateStatus(trx.id, 'Rejected');
        }
    });
  };

  // 2. Selesai Desain
  const handleFinishDesign = (id) => {
    Swal.fire({
        title: 'Desain Selesai?',
        text: "Kirim ke bagian Produksi?",
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Ya, Kirim',
    }).then((result) => {
        if (result.isConfirmed) {
            updateStatus(id, 'Production');
        }
    });
  };

  // 3. Restore (Dari Ditolak -> Antrian)
  const handleRestoreOrder = (id) => {
    Swal.fire({
        title: 'Proses Ulang?',
        text: "Pesanan akan dikembalikan ke tab 'Masuk' (Queue) untuk ditinjau ulang.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b', // Amber/Orange
        confirmButtonText: 'Ya, Kembalikan',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            updateStatus(id, 'Queue');
        }
    });
  };

  // --- FILTER DATA ---
  const queueData = transactions.filter(t => t.order_status === 'Queue');
  const designingData = transactions.filter(t => t.order_status === 'Designing');
  const rejectedData = transactions.filter(t => t.order_status === 'Rejected'); 
  const historyData = transactions.filter(t => ['Production', 'Ready', 'Completed'].includes(t.order_status));

  // --- RENDER CARD ---
  const renderCard = (trx, type) => (
    <div 
        key={trx.id} 
        className={`group relative backdrop-blur-md border p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer ${
            type === 'rejected' 
            ? 'bg-red-50/30 border-red-200/50' 
            : 'bg-white/40 border-white/40 hover:bg-white/50'
        }`}
        onClick={() => handleViewDetails(trx)} // <-- Menambahkan onClick di sini
    >
        
        {/* Header Card */}
        <div className="flex justify-between items-start mb-6 border-b border-white/20 pb-4">
            <div>
                <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight flex items-center gap-2">
                    {trx.customers?.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-800/80 text-white text-[10px] font-mono rounded-full tracking-widest">
                        {trx.invoice_number}
                    </span>
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <Clock size={12}/> {new Date(trx.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${
                type === 'queue' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
                type === 'designing' ? 'bg-amber-100/50 text-amber-700 border-amber-200' :
                type === 'rejected' ? 'bg-red-100/80 text-red-700 border-red-200' :
                'bg-green-100/50 text-green-700 border-green-200'
            }`}>
                {trx.order_status}
            </div>
        </div>

        {/* Detail Kemasan */}
        <div className="space-y-3 relative z-10">
            {trx.items.map((item, idx) => (
                <div key={idx} className="bg-white/40 rounded-xl p-3 border border-white/50 shadow-sm hover:bg-white/70 transition">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-800">{item.productName}</p>
                            <p className="text-xs text-slate-600">{item.packagingType} - {item.packagingSize}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            {item.hasDesign ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-200/50 px-2 py-0.5 rounded-full">
                                    <CheckCircle size={10}/> Ready
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-200/50 px-2 py-0.5 rounded-full animate-pulse">
                                    <Palette size={10}/> Desain Baru
                                </span>
                            )}
                        </div>
                    </div>
                    {item.note && (
                        <div className="mt-2 p-2 bg-yellow-100/50 rounded text-xs text-yellow-800 italic border border-yellow-200/50">
                            Note: "{item.note}"
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-white/20 flex justify-end">
            {type === 'queue' && (
                <button onClick={(e) => { e.stopPropagation(); handleConfirmOrder(trx); }} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                    <Eye size={18}/> Tinjau Pesanan
                </button>
            )}
            {type === 'designing' && (
                <button onClick={(e) => { e.stopPropagation(); handleFinishDesign(trx.id); }} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                    <CheckCircle size={18}/> Selesai Desain
                </button>
            )}
            {type === 'rejected' && (
                <button onClick={(e) => { e.stopPropagation(); handleRestoreOrder(trx.id); }} className="w-full bg-white text-red-500 border border-red-200 py-3 rounded-xl font-bold shadow-sm hover:bg-red-50 hover:border-red-300 transition-transform flex justify-center items-center gap-2">
                    <RotateCcw size={18}/> Proses Ulang (Kembalikan)
                </button>
            )}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen -m-6 p-6 relative overflow-hidden" style={backgroundStyle}>
        
        <div 
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
            style={{
                background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.25), transparent 80%)`
            }}
        />

        {/* Tailwind CSS keyframes for animations */}
        <style>{`
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .glass-nav {
                background: rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.18);
            }
            ::-webkit-scrollbar { width: 0px; background: transparent; }
            
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

            @keyframes slide-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }

        `}</style>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 text-white relative z-10">
            <div>
                <h1 className="text-5xl font-black tracking-tight drop-shadow-lg flex items-center gap-3">
                    <Sparkles className="text-yellow-300 animate-pulse" size={40}/> 
                    Creative Space
                </h1>
                <p className="text-blue-50 font-medium mt-2 text-lg">Dashboard Desain & Produksi</p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0 flex-wrap">
                <div className="glass-nav px-5 py-3 rounded-2xl text-center min-w-[90px]">
                    <span className="block text-2xl font-bold">{queueData.length}</span>
                    <span className="text-[10px] font-bold uppercase opacity-80">Antrian</span>
                </div>
                <div className="glass-nav px-5 py-3 rounded-2xl text-center min-w-[90px]">
                    <span className="block text-2xl font-bold">{designingData.length}</span>
                    <span className="text-[10px] font-bold uppercase opacity-80">Proses</span>
                </div>
                <div className="glass-nav px-5 py-3 rounded-2xl text-center min-w-[90px] bg-red-500/20 border-red-400/30">
                    <span className="block text-2xl font-bold text-red-100">{rejectedData.length}</span>
                    <span className="text-[10px] font-bold uppercase opacity-80 text-red-100">Ditolak</span>
                </div>
            </div>
        </div>

        <div className="sticky top-4 z-30 flex justify-center mb-10">
            <div className="glass-nav p-2 rounded-2xl flex gap-2 shadow-2xl overflow-x-auto">
                {[
                    { id: 'queue', label: 'Masuk', icon: <Layers size={18}/>, color: 'blue' },
                    { id: 'designing', label: 'Desain', icon: <Palette size={18}/>, color: 'amber' },
                    { id: 'rejected', label: 'Ditolak', icon: <XCircle size={18}/>, color: 'red' },
                    { id: 'history', label: 'Riwayat', icon: <History size={18}/>, color: 'emerald' },
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${
                            activeTab === tab.id
                            ? `bg-white text-${tab.color}-600 shadow-lg scale-105` 
                            : 'text-white hover:bg-white/10'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 pb-20">
            {isLoading ? (
                 <div className="flex justify-center items-center h-64 text-white font-bold animate-pulse text-xl">
                    Sedang memuat kanvas...
                 </div>
            ) : (
                <>
                    {/* GRID VIEW (Queue, Designing, Rejected) */}
                    {activeTab !== 'history' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(activeTab === 'queue' ? queueData : activeTab === 'designing' ? designingData : rejectedData).length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/70">
                                    <div className="glass-nav p-8 rounded-full mb-6">
                                        {activeTab === 'rejected' ? <AlertTriangle size={64} className="text-red-200"/> : <CheckCircle size={64} />}
                                    </div>
                                    <p className="text-2xl font-bold">
                                        {activeTab === 'rejected' ? 'Tidak ada pesanan ditolak.' : 'Semua Beres!'}
                                    </p>
                                    <p className="text-lg opacity-80">Kerja bagus, tetap semangat!</p>
                                </div>
                            ) : (
                                (activeTab === 'queue' ? queueData : activeTab === 'designing' ? designingData : rejectedData).map(t => renderCard(t, activeTab))
                            )}
                        </div>
                    )}

                    {/* LIST VIEW (History) */}
                    {activeTab === 'history' && (
                        <div className="glass-nav rounded-3xl overflow-hidden shadow-2xl border border-white/30">
                            <table className="w-full text-left text-white">
                                <thead className="bg-black/10 text-sm uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-8 py-5">Invoice</th>
                                        <th className="px-8 py-5">Pelanggan</th>
                                        <th className="px-8 py-5">Item</th>
                                        <th className="px-8 py-5 text-center">Status Akhir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 text-sm font-medium">
                                    {historyData.map(trx => (
                                        <tr key={trx.id} className="hover:bg-white/10 transition">
                                            <td className="px-8 py-5">{trx.invoice_number}</td>
                                            <td className="px-8 py-5">{trx.customers?.name}</td>
                                            <td className="px-8 py-5">
                                                {trx.items.map((i, x) => (
                                                    <div key={x} className="mb-1 opacity-90">• {i.productName}</div>
                                                ))}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/20 text-emerald-100 border-emerald-400">
                                                    {trx.order_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>

        {/* Render Modal */}
        <OrderDetailModal 
            order={selectedOrder} 
            onClose={() => setIsModalOpen(false)} 
            isOpen={isModalOpen}
        />
    </div>
  );
};

export default DesignerDashboard;