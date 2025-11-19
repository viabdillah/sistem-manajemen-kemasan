import { useState, useEffect, useCallback } from 'react';
import { 
  Package, Search, Plus, AlertTriangle, 
  ArrowUpCircle, ArrowDownCircle, Trash2, Edit3, X, 
  FolderPlus, Filter, Ruler, FileText, DollarSign 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../services/supabaseClient';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isStockModalOpen, setIsStockModalOpen] = useState(false); 
  
  const [modalMode, setModalMode] = useState('add'); 
  const [selectedItem, setSelectedItem] = useState(null);
  
  // UPDATE: Tambahkan cost_per_unit
  const [formData, setFormData] = useState({ 
    id: '', 
    name: '', 
    category: '', 
    size: '', 
    stock: 0, 
    unit: 'pcs', 
    min_stock: 10,
    cost_per_unit: 0 // <--- Field Baru
  });
  
  const [stockData, setStockData] = useState({ type: 'in', amount: 0, notes: '' });

  // --- 1. FETCH DATA ---
  const fetchInventory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setItems(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // --- 2. LOGIC KATEGORI & FILTER ---
  const existingCategories = Array.from(new Set(items.map(i => i.category))).sort();

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === 'All' || item.category === filterCategory;
    return matchSearch && matchCat;
  });

  // --- 3. HANDLERS ---
  const handleAddCategory = async () => {
    const { value: newCat } = await Swal.fire({
        title: 'Buat Kategori Baru',
        input: 'text',
        inputLabel: 'Masukkan nama kategori',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) return 'Nama kategori tidak boleh kosong!';
        }
    });

    if (newCat) {
        setModalMode('add');
        setFormData({ id: '', name: '', category: newCat, size: '', stock: 0, unit: 'pcs', min_stock: 10, cost_per_unit: 0 });
        setIsModalOpen(true);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            name: formData.name,
            category: formData.category,
            size: formData.size,
            stock: parseInt(formData.stock),
            unit: formData.unit,
            min_stock: parseInt(formData.min_stock),
            cost_per_unit: parseInt(formData.cost_per_unit) // <--- Simpan Harga
        };

        let error;
        if (modalMode === 'add') {
            const { error: insertErr } = await supabase.from('inventory').insert([payload]);
            error = insertErr;
        } else {
            const { error: updateErr } = await supabase.from('inventory').update(payload).eq('id', formData.id);
            error = updateErr;
        }

        if (error) throw error;

        setIsModalOpen(false);
        fetchInventory();
        Swal.fire('Berhasil', 'Data inventory tersimpan.', 'success');
    } catch (err) {
        Swal.fire('Gagal', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus Item?',
        text: "Data stok akan hilang permanen.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Hapus'
    });
    if (result.isConfirmed) {
        await supabase.from('inventory').delete().eq('id', id);
        fetchInventory();
        Swal.fire('Terhapus', '', 'success');
    }
  };

  const openStockModal = (item, type) => {
    setSelectedItem(item);
    setStockData({ type, amount: '', notes: '' });
    setIsStockModalOpen(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    const amount = parseInt(stockData.amount);
    if (amount <= 0) return Swal.fire('Error', 'Jumlah harus > 0', 'warning');

    let newStock = selectedItem.stock;
    if (stockData.type === 'in') newStock += amount;
    else newStock -= amount;

    if (newStock < 0) return Swal.fire('Error', 'Stok tidak cukup!', 'error');

    try {
        const { error: stockError } = await supabase
            .from('inventory')
            .update({ stock: newStock })
            .eq('id', selectedItem.id);
        
        if (stockError) throw stockError;

        const { error: logError } = await supabase
            .from('inventory_logs')
            .insert([{
                inventory_id: selectedItem.id,
                type: stockData.type,
                amount: amount,
                notes: stockData.notes
            }]);
            
        if (logError) console.error(logError);

        setIsStockModalOpen(false);
        fetchInventory();
        Swal.fire({
            icon: 'success',
            title: stockData.type === 'in' ? 'Stok Masuk' : 'Stok Keluar',
            text: `Stok sekarang: ${newStock} ${selectedItem.unit}`,
            timer: 1500,
            showConfirmButton: false
        });
    } catch (err) {
        Swal.fire('Gagal', err.message, 'error');
    }
  };


  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Package className="text-blue-600" size={32}/> Gudang & Stok
                </h1>
                <p className="text-gray-500">Kelola bahan baku produksi.</p>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
                <button onClick={handleAddCategory} className="flex-1 lg:flex-none bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm transition">
                    <FolderPlus size={18}/> Tambah Kategori
                </button>
                <button 
                    onClick={() => {
                        setModalMode('add');
                        setFormData({ id: '', name: '', category: '', size: '', stock: 0, unit: 'pcs', min_stock: 10, cost_per_unit: 0 });
                        setIsModalOpen(true);
                    }}
                    className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium shadow-md transition"
                >
                    <Plus size={18}/> Tambah Item
                </button>
            </div>
        </div>

        {/* FILTER */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 items-center">
            <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Cari nama barang..." 
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="w-full md:w-64 relative">
                <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select 
                    className="w-full pl-10 pr-8 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer appearance-none"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="All">Semua Kategori</option>
                    <option disabled>──────────</option>
                    {existingCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* GRID ITEMS */}
        {isLoading ? (
            <div className="text-center py-10">Memuat data gudang...</div>
        ) : filteredItems.length === 0 ? null : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                    const isLowStock = item.stock <= item.min_stock;
                    return (
                        <div key={item.id} className={`bg-white p-5 rounded-xl shadow-sm border transition-all hover:shadow-md relative group ${isLowStock ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}>
                            
                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setModalMode('edit'); setFormData(item); setIsModalOpen(true); }} className="p-1.5 bg-white text-blue-500 rounded border border-gray-200 hover:bg-blue-50">
                                    <Edit3 size={14}/>
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white text-red-500 rounded border border-gray-200 hover:bg-red-50">
                                    <Trash2 size={14}/>
                                </button>
                            </div>

                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{item.category}</span>
                                    {isLowStock && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse">
                                            <AlertTriangle size={10}/> Low
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1" title={item.name}>{item.name}</h3>
                                {item.size && item.size !== '-' && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Ruler size={12}/> {item.size}</p>
                                )}
                            </div>

                            {/* INFO HARGA BELI (Cost Per Unit) */}
                            <div className="mb-4 pb-2 border-b border-gray-50">
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <DollarSign size={10}/> Harga Beli
                                </p>
                                <p className="text-sm font-semibold text-slate-600">
                                    Rp {item.cost_per_unit ? item.cost_per_unit.toLocaleString() : '0'} <span className="text-xs font-normal">/{item.unit}</span>
                                </p>
                            </div>

                            <div className="flex items-end justify-between mb-4">
                                <div>
                                    <p className="text-xs text-gray-500">Total Stok</p>
                                    <p className={`text-3xl font-black ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                                        {item.stock} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => openStockModal(item, 'in')} className="flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 rounded-lg font-bold text-sm hover:bg-green-100 transition">
                                    <ArrowUpCircle size={16}/> Masuk
                                </button>
                                <button onClick={() => openStockModal(item, 'out')} className="flex items-center justify-center gap-2 py-2 bg-orange-50 text-orange-700 rounded-lg font-bold text-sm hover:bg-orange-100 transition">
                                    <ArrowDownCircle size={16}/> Pakai
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* MODAL TAMBAH/EDIT */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="text-xl font-bold text-gray-800">{modalMode === 'add' ? 'Item Baru' : 'Edit Item'}</h3>
                        <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                    </div>
                    <form onSubmit={handleSaveItem} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-600">Nama Barang</label>
                            <input type="text" required className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600">Kategori</label>
                                <input 
                                    type="text" 
                                    list="category-list"
                                    className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    placeholder="Pilih / Ketik..."
                                    required
                                />
                                <datalist id="category-list">
                                    {existingCategories.map((cat, i) => <option key={i} value={cat}/>)}
                                </datalist>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600">Ukuran</label>
                                <input type="text" className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cth: A4" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-bold text-gray-600">Satuan</label>
                                <input type="text" required className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="pcs, kg..." value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600">Stok Awal</label>
                                <input type="number" required className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} disabled={modalMode === 'edit'} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600">Harga Beli (Rp)</label>
                                <input type="number" required className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" value={formData.cost_per_unit} onChange={e => setFormData({...formData, cost_per_unit: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600">Min. Alert</label>
                                <input type="number" required className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})} />
                            </div>
                        </div>
                        
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-2 shadow-lg">Simpan Data</button>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL UPDATE STOK */}
        {isStockModalOpen && selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-slide-up">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-gray-800">Update Stok</h3>
                        <button onClick={() => setIsStockModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                    </div>
                    <div className="mb-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        Produk: <span className="font-bold text-gray-700">{selectedItem.name}</span> <br/>
                        {selectedItem.size && <span className="text-xs text-gray-400 block">Ukuran: {selectedItem.size}</span>}
                        Saat ini: <span className="font-bold text-blue-600">{selectedItem.stock} {selectedItem.unit}</span>
                    </div>
                    
                    <form onSubmit={handleUpdateStock} className="space-y-4">
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button type="button" onClick={() => setStockData({...stockData, type: 'in'})} className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-1 transition ${stockData.type === 'in' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <ArrowUpCircle size={16}/> Masuk
                            </button>
                            <button type="button" onClick={() => setStockData({...stockData, type: 'out'})} className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-1 transition ${stockData.type === 'out' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <ArrowDownCircle size={16}/> Keluar
                            </button>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-600">Jumlah {stockData.type === 'in' ? 'Penambahan' : 'Pengurangan'}</label>
                            <input type="number" autoFocus className="w-full border rounded-xl p-3 text-2xl font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none text-slate-700" placeholder="0" value={stockData.amount} onChange={e => setStockData({...stockData, amount: e.target.value})} />
                        </div>
                        
                        {/* INPUT NOTES */}
                        <div>
                             <label className="text-sm font-bold text-gray-600 flex items-center gap-1"><FileText size={14} /> Keterangan</label>
                             <textarea className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1" rows="2" placeholder={stockData.type === 'in' ? 'Cth: Restock Vendor A' : 'Cth: Produksi Pesanan Budi'} value={stockData.notes} onChange={e => setStockData({...stockData, notes: e.target.value})} />
                        </div>

                        <button type="submit" className={`w-full text-white py-3 rounded-xl font-bold shadow-lg transition ${stockData.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                            {stockData.type === 'in' ? 'Simpan Stok Masuk' : 'Simpan Penggunaan'}
                        </button>
                    </form>
                </div>
            </div>
        )}

    </div>
  );
};

export default InventoryPage;