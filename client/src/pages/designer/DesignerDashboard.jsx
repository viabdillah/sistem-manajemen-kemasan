import { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, Palette, Eye, Sparkles 
} from 'lucide-react';
import Swal from 'sweetalert2';

const DesignerDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  // --- 2. FETCH DATA (Fungsi Biasa) ---
  const fetchTransactions = async () => {
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/transactions');
      const data = await response.json();
      setTransactions(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  // REVISI FINAL: Dependency Array KOSONG [] + Matikan Warning
  // Ini mencegah looping saat mouse bergerak
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 3. UPDATE STATUS ---
  const updateStatus = async (id, newStatus) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if(res.ok) {
            fetchTransactions(); 
            const icon = newStatus === 'Rejected' ? 'error' : 'success';
            Swal.fire({
                title: 'Status Diperbarui',
                text: `Pesanan dipindahkan ke status: ${newStatus}`,
                icon: icon,
                confirmButtonColor: '#3b82f6'
            });
        }
    } catch (error) {
        console.error('Gagal update status:', error);
        Swal.fire('Error', 'Gagal update status', 'error');
    }
  };

  // --- HANDLERS ---
  const handleConfirmOrder = (trx) => {
    const needsDesign = trx.items.some(item => item.hasDesign === false);
    
    Swal.fire({
        title: 'Konfirmasi Pesanan?',
        html: needsDesign 
            ? `<div class="text-orange-600 font-bold mb-2">⚠️ Butuh Desain Baru</div> Masuk ke tab Proses Desain?` 
            : `<div class="text-green-600 font-bold mb-2">✅ Desain Ready</div> Langsung kirim ke Produksi?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Proses',
        cancelButtonText: 'Tolak',
    }).then((result) => {
        if (result.isConfirmed) {
            const nextStatus = needsDesign ? 'Designing' : 'Production';
            updateStatus(trx._id, nextStatus);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            updateStatus(trx._id, 'Rejected');
        }
    });
  };

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

  const queueData = transactions.filter(t => t.orderStatus === 'Queue');
  const designingData = transactions.filter(t => t.orderStatus === 'Designing');
  const historyData = transactions.filter(t => ['Production', 'Ready', 'Completed', 'Rejected'].includes(t.orderStatus));

  // --- RENDER CARD ---
  const renderCard = (trx, type) => (
    <div key={trx._id} className="group relative bg-white/40 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:bg-white/50 transition-all duration-500 transform hover:-translate-y-1">
        
        <div className="flex justify-between items-start mb-6 border-b border-white/20 pb-4">
            <div>
                <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight flex items-center gap-2">
                    {trx.customerId?.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-800/80 text-white text-[10px] font-mono rounded-full tracking-widest">
                        {trx.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <Clock size={12}/> {new Date(trx.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${
                type === 'queue' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
                type === 'designing' ? 'bg-amber-100/50 text-amber-700 border-amber-200' :
                'bg-green-100/50 text-green-700 border-green-200'
            }`}>
                {trx.orderStatus}
            </div>
        </div>

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

        {type !== 'history' && (
            <div className="mt-6 pt-4 border-t border-white/20 flex justify-end">
                {type === 'queue' ? (
                    <button onClick={() => handleConfirmOrder(trx)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                        <Eye size={18}/> Tinjau Pesanan
                    </button>
                ) : (
                    <button onClick={() => handleFinishDesign(trx._id)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                        <CheckCircle size={18}/> Selesai Desain
                    </button>
                )}
            </div>
        )}
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
        `}</style>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 text-white relative z-10">
            <div>
                <h1 className="text-5xl font-black tracking-tight drop-shadow-lg flex items-center gap-3">
                    <Sparkles className="text-yellow-300 animate-pulse" size={40}/> 
                    Creative Space
                </h1>
                <p className="text-blue-50 font-medium mt-2 text-lg">Dashboard Desain & Produksi</p>
            </div>
            
            <div className="flex gap-4 mt-4 md:mt-0">
                <div className="glass-nav px-6 py-3 rounded-2xl text-center min-w-[100px]">
                    <span className="block text-3xl font-bold">{queueData.length}</span>
                    <span className="text-xs font-bold uppercase opacity-80">Antrian</span>
                </div>
                <div className="glass-nav px-6 py-3 rounded-2xl text-center min-w-[100px]">
                    <span className="block text-3xl font-bold">{designingData.length}</span>
                    <span className="text-xs font-bold uppercase opacity-80">Proses</span>
                </div>
            </div>
        </div>

        <div className="sticky top-4 z-30 flex justify-center mb-10">
            <div className="glass-nav p-2 rounded-2xl flex gap-2 shadow-2xl">
                {['queue', 'designing', 'history'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                            activeTab === tab 
                            ? 'bg-white text-blue-600 shadow-lg scale-105' 
                            : 'text-white hover:bg-white/10'
                        }`}
                    >
                        {tab === 'queue' ? 'Masuk' : tab === 'designing' ? 'Desain' : 'Riwayat'}
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
                    {activeTab !== 'history' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(activeTab === 'queue' ? queueData : designingData).length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/70">
                                    <div className="glass-nav p-8 rounded-full mb-6">
                                        <CheckCircle size={64} />
                                    </div>
                                    <p className="text-2xl font-bold">Semua Beres!</p>
                                    <p className="text-lg">Nikmati kopi Anda sambil menunggu pesanan baru.</p>
                                </div>
                            ) : (
                                (activeTab === 'queue' ? queueData : designingData).map(t => renderCard(t, activeTab))
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="glass-nav rounded-3xl overflow-hidden shadow-2xl border border-white/30">
                            <table className="w-full text-left text-white">
                                <thead className="bg-black/10 text-sm uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-8 py-5">Invoice</th>
                                        <th className="px-8 py-5">Pelanggan</th>
                                        <th className="px-8 py-5">Item</th>
                                        <th className="px-8 py-5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 text-sm font-medium">
                                    {historyData.map(trx => (
                                        <tr key={trx._id} className="hover:bg-white/10 transition">
                                            <td className="px-8 py-5">{trx.invoiceNumber}</td>
                                            <td className="px-8 py-5">{trx.customerId?.name}</td>
                                            <td className="px-8 py-5">
                                                {trx.items.map((i, x) => (
                                                    <div key={x} className="mb-1 opacity-90">• {i.productName}</div>
                                                ))}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                    trx.orderStatus === 'Rejected' 
                                                    ? 'bg-red-500/20 text-red-100 border-red-400' 
                                                    : 'bg-emerald-500/20 text-emerald-100 border-emerald-400'
                                                }`}>
                                                    {trx.orderStatus === 'Rejected' ? 'Ditolak' : 'Selesai'}
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
    </div>
  );
};

export default DesignerDashboard;