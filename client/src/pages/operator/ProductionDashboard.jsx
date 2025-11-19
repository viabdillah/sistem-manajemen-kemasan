import { useState, useEffect, useCallback } from 'react';
import { 
  Wrench, Package, CheckCircle, Clock, 
  Loader, CheckSquare, Play, Plus, Trash2, X, AlertTriangle, History, Layers
} from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../services/supabaseClient';

const ProductionDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming'); 

  // Modal States
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [materialsUsed, setMaterialsUsed] = useState([{ inventoryId: '', amount: '' }]);

  // --- 1. FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      const { data: trxData, error: trxError } = await supabase
        .from('transactions')
        .select('*, customers(*)') 
        .order('created_at', { ascending: false }); // Terbaru paling atas

      if (trxError) throw trxError;
      setTransactions(trxData);

      const { data: invData, error: invError } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true });

      if (invError) throw invError;
      setInventoryItems(invData);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 2. UPDATE STATUS ---
  const updateStatus = async (id, newStatus) => {
    try {
        const { error } = await supabase
            .from('transactions')
            .update({ order_status: newStatus })
            .eq('id', id);

        if (error) throw error;

        fetchData(); 
        Swal.fire({
            title: 'Berhasil',
            text: `Status pesanan berubah menjadi: ${newStatus}`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error("Gagal update status:", error);
        Swal.fire('Error', 'Gagal update status', 'error');
    }
  };

  // --- 3. HANDLERS ---
  const openProductionModal = (trx) => {
    setSelectedTrx(trx);
    setMaterialsUsed([{ inventoryId: '', amount: '' }]);
    setIsMaterialModalOpen(true);
  };

  const addMaterialRow = () => {
    setMaterialsUsed([...materialsUsed, { inventoryId: '', amount: '' }]);
  };

  const removeMaterialRow = (index) => {
    const list = [...materialsUsed];
    list.splice(index, 1);
    setMaterialsUsed(list);
  };

  const handleMaterialChange = (index, field, value) => {
    const list = [...materialsUsed];
    list[index][field] = value;
    setMaterialsUsed(list);
  };

  // --- LOGIC MULAI PRODUKSI (UPDATE BAHAN) ---
  const handleSubmitProduction = async () => {
    const validMaterials = materialsUsed.filter(m => m.inventoryId && m.amount > 0);
    
    if (validMaterials.length === 0) {
        const result = await Swal.fire({
            title: 'Tanpa Bahan?',
            text: "Yakin mulai tanpa mencatat bahan?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Lanjut'
        });
        if (!result.isConfirmed) return;
    }

    try {
        setIsLoading(true);
        
        // A. Siapkan Data Snapshot Bahan untuk disimpan di Transaksi
        const materialsSnapshot = validMaterials.map(m => {
            const itemInfo = inventoryItems.find(inv => inv.id === parseInt(m.inventoryId));
            return {
                name: itemInfo.name,
                amount: m.amount,
                unit: itemInfo.unit
            };
        });

        // B. Update Status & Simpan Snapshot Bahan
        const { error: statusError } = await supabase
            .from('transactions')
            .update({ 
                order_status: 'Processing',
                materials_used: materialsSnapshot // <--- Simpan di sini
            })
            .eq('id', selectedTrx.id);
        
        if (statusError) throw statusError;

        // C. Kurangi Stok di Gudang
        const inventoryUpdates = validMaterials.map(async (item) => {
            const currentItem = inventoryItems.find(inv => inv.id === parseInt(item.inventoryId));
            const newStock = currentItem.stock - parseInt(item.amount);
            
            await supabase.from('inventory').update({ stock: newStock }).eq('id', item.inventoryId);
            
            // Catat Log Gudang
            await supabase.from('inventory_logs').insert([{
                inventory_id: item.inventoryId,
                type: 'out',
                amount: parseInt(item.amount),
                notes: `Produksi Invoice: ${selectedTrx.invoice_number}`
            }]);
        });

        await Promise.all(inventoryUpdates);

        setIsLoading(false);
        setIsMaterialModalOpen(false);
        fetchData(); 

        Swal.fire({ icon: 'success', title: 'Produksi Dimulai!', text: 'Bahan baku telah dicatat.' });

    } catch (error) {
        console.error(error);
        setIsLoading(false);
        Swal.fire('Gagal', error.message, 'error');
    }
  };

  const handleFinishJob = (trx) => {
    Swal.fire({
        title: 'Produksi Selesai?',
        text: "Barang siap diambil?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Ya, Siap',
    }).then((result) => {
        if (result.isConfirmed) updateStatus(trx.id, 'Ready');
    });
  };

  const handleHandover = (trx) => {
    const isPaidOff = trx.remaining_balance <= 0;
    if (!isPaidOff) {
        Swal.fire({ title: 'Belum Lunas!', text: `Sisa tagihan: Rp ${trx.remaining_balance.toLocaleString()}`, icon: 'error' });
        return;
    }
    Swal.fire({
        title: 'Serah Terima',
        text: "Barang diserahkan & Selesai.",
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Selesaikan',
    }).then((result) => {
        if (result.isConfirmed) updateStatus(trx.id, 'Completed');
    });
  };

  // --- FILTER DATA ---
  const incomingData = transactions.filter(t => t.order_status === 'Production');
  const processingData = transactions.filter(t => t.order_status === 'Processing');
  const readyData = transactions.filter(t => t.order_status === 'Ready');
  const completedData = transactions.filter(t => t.order_status === 'Completed');

  // --- RENDER HELPERS ---
  const renderItems = (items) => (
    <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
        {items.map((item, idx) => (
            <div key={idx} className="text-sm flex justify-between items-center border-b last:border-0 border-gray-200 pb-2 last:pb-0 mb-2 last:mb-0">
                <div>
                    <span className="font-bold text-gray-700 block">{item.productName}</span>
                    <div className="text-xs text-gray-500">{item.packagingType} ({item.packagingSize})</div>
                    {item.note && <div className="text-xs text-orange-600 italic mt-1">"{item.note}"</div>}
                </div>
                <div className="text-right">
                    <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold">x{item.qty}</span>
                </div>
            </div>
        ))}
    </div>
  );

  // --- RENDER BAHAN YANG DIPAKAI ---
  const renderMaterialsUsed = (materials) => {
    if (!materials || materials.length === 0) return null;
    return (
        <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-900">
            <p className="font-bold mb-1 flex items-center gap-1"><Layers size={12}/> Bahan Digunakan:</p>
            <ul className="list-disc list-inside space-y-0.5">
                {materials.map((m, i) => (
                    <li key={i}>{m.name}: <strong>{m.amount} {m.unit}</strong></li>
                ))}
            </ul>
        </div>
    );
  };

  if (isLoading && !transactions.length) return <div className="p-10 text-center">Memuat data produksi...</div>;

  const dataToRender = 
    activeTab === 'incoming' ? incomingData : 
    activeTab === 'processing' ? processingData : 
    activeTab === 'ready' ? readyData : 
    completedData; 

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Wrench className="text-blue-600" size={32}/> Area Produksi
                </h1>
                <p className="text-gray-500">Pantau dan kelola proses pencetakan kemasan.</p>
            </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
            <button onClick={() => setActiveTab('incoming')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 ${activeTab === 'incoming' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}><Package size={18}/> Masuk <span className="bg-blue-100 px-2 rounded-full text-xs">{incomingData.length}</span></button>
            <button onClick={() => setActiveTab('processing')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 ${activeTab === 'processing' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500'}`}><Loader size={18} className={activeTab === 'processing' ? 'animate-spin' : ''}/> Proses <span className="bg-amber-100 px-2 rounded-full text-xs">{processingData.length}</span></button>
            <button onClick={() => setActiveTab('ready')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 ${activeTab === 'ready' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}><CheckCircle size={18}/> Siap <span className="bg-green-100 px-2 rounded-full text-xs">{readyData.length}</span></button>
            <button onClick={() => setActiveTab('history')} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 border-b-2 ${activeTab === 'history' ? 'border-slate-600 text-slate-600' : 'border-transparent text-gray-500'}`}><History size={18}/> Riwayat</button>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataToRender.length === 0 && (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">Tidak ada data di tahap ini.</div>
            )}

            {dataToRender.map(trx => (
                <div key={trx.id} className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition relative ${activeTab === 'history' ? 'opacity-90 hover:opacity-100' : 'border-l-4 border-l-blue-500'}`}>
                    
                    {/* Indikator Lunas */}
                    <div className="absolute top-4 right-4">
                        {trx.remaining_balance > 0 ? (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200">BELUM LUNAS</span>
                        ) : (
                            <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded border border-green-200">LUNAS</span>
                        )}
                    </div>

                    <div className="mb-4">
                        <h3 className="font-bold text-lg text-gray-800">{trx.customers?.name || 'Pelanggan'}</h3>
                        <p className="text-xs text-gray-500 font-mono">{trx.invoice_number}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={12}/> {new Date(trx.created_at).toLocaleDateString('id-ID')}</p>
                    </div>

                    {renderItems(trx.items)}
                    
                    {/* SHOW MATERIALS USED (Untuk History, Processing, Ready) */}
                    {trx.materials_used && renderMaterialsUsed(trx.materials_used)}

                    <div className="mt-5 pt-4 border-t border-gray-100">
                        {activeTab === 'incoming' && (
                            <button onClick={() => openProductionModal(trx)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition shadow-sm">
                                <Play size={16} fill="currentColor"/> Mulai Produksi
                            </button>
                        )}
                        {activeTab === 'processing' && (
                            <button onClick={() => handleFinishJob(trx)} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition shadow-sm">
                                <CheckSquare size={16}/> Selesai & QC
                            </button>
                        )}
                        {activeTab === 'ready' && (
                            <button onClick={() => handleHandover(trx)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition shadow-sm">
                                <Package size={16}/> Serahkan Barang
                            </button>
                        )}
                         {activeTab === 'history' && (
                            <div className="text-center text-xs text-gray-400 font-medium">
                                Transaksi Selesai
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>

        {/* MODAL PEMAKAIAN BAHAN (TETAP SAMA) */}
        {isMaterialModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                    
                    <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
                        <div>
                            <h3 className="font-bold text-lg">Mulai Produksi</h3>
                            <p className="text-xs opacity-80 font-mono">{selectedTrx?.invoice_number}</p>
                        </div>
                        <button onClick={() => setIsMaterialModalOpen(false)} className="text-white hover:text-blue-200"><X size={24}/></button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 flex items-start gap-3">
                            <AlertTriangle className="text-blue-600 shrink-0" size={20}/>
                            <div>
                                <p className="text-sm font-bold text-blue-800">Catatan Penggunaan Bahan:</p>
                                <p className="text-xs text-blue-600 mt-1">Silakan input bahan baku yang akan dipakai. Ini akan tersimpan di riwayat produksi.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {materialsUsed.map((mat, index) => (
                                <div key={index} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Pilih Bahan {index + 1}</label>
                                        <select 
                                            className="w-full border rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={mat.inventoryId}
                                            onChange={(e) => handleMaterialChange(index, 'inventoryId', e.target.value)}
                                        >
                                            <option value="">-- Pilih Item --</option>
                                            {inventoryItems.map(inv => (
                                                <option key={inv.id} value={inv.id}>
                                                    {inv.name} (Sisa: {inv.stock} {inv.unit})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Jml</label>
                                        <input 
                                            type="number" 
                                            className="w-full border rounded-lg p-2 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0"
                                            value={mat.amount}
                                            onChange={(e) => handleMaterialChange(index, 'amount', e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeMaterialRow(index)}
                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-200 mb-0.5"
                                        disabled={materialsUsed.length === 1}
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button onClick={addMaterialRow} className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                            <Plus size={16}/> Tambah Bahan Lain
                        </button>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                        <button onClick={() => setIsMaterialModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">Batal</button>
                        <button onClick={handleSubmitProduction} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg flex items-center gap-2">
                            {isLoading ? <Loader size={18} className="animate-spin"/> : <Play size={18} fill="currentColor"/>}
                            Mulai Proses
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProductionDashboard;