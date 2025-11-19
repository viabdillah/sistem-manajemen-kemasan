import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Package, PlusCircle, MinusCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const PackagingTypeManagement = () => {
  // --- STATES ---
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  
  // State Form dengan array 'sizes' untuk varian
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    sizes: [] 
  });

  // --- FETCH DATA (READ) ---
  const fetchTypes = useCallback(async () => {
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/packaging-types');
      const data = await response.json();
      setTypes(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Gagal mengambil jenis kemasan:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // --- HANDLERS FORM ---
  
  // Buka Modal Tambah
  const handleAdd = () => {
    setModalMode('add');
    // Default 1 baris kosong untuk ukuran agar user langsung paham
    setFormData({ id: '', name: '', description: '', sizes: [{ size: '', price: '' }] });
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleEdit = (type) => {
    setModalMode('edit');
    setFormData({
      id: type._id,
      name: type.name,
      description: type.description,
      // Jika data lama tidak punya sizes, beri default kosong
      sizes: type.sizes && type.sizes.length > 0 ? type.sizes : [{ size: '', price: '' }]
    });
    setIsModalOpen(true);
  };

  // --- HANDLERS DYNAMIC INPUT (Ukuran & Harga) ---
  
  // Ubah value pada baris tertentu
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData({ ...formData, sizes: newSizes });
  };

  // Tambah baris baru
  const addSizeField = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: '', price: '' }]
    });
  };

  // Hapus baris tertentu
  const removeSizeField = (index) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  // --- ACTION HANDLERS (Delete & Submit) ---

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Jenis Kemasan?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/packaging-types/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            fetchTypes(); 
            Swal.fire('Terhapus!', 'Jenis kemasan berhasil dihapus.', 'success');
        } else {
            const data = await response.json();
            Swal.fire('Gagal!', data.message || 'Gagal menghapus jenis kemasan.', 'error');
        }
      } catch (error) {
        console.error("Error deleting type:", error); 
        Swal.fire('Error', 'Tidak dapat terhubung ke server.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi: Filter baris yang kosong sebelum dikirim ke server
    const validSizes = formData.sizes.filter(s => s.size && s.price);
    
    const payload = {
        ...formData,
        sizes: validSizes
    };

    const url = modalMode === 'add' 
      ? '${import.meta.env.VITE_API_URL}/api/packaging-types' 
      : `${import.meta.env.VITE_API_URL}/api/packaging-types/${formData.id}`;
    
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ id: '', name: '', description: '', sizes: [] }); // Reset form
        fetchTypes(); 
        
        Swal.fire({
            icon: 'success', 
            title: 'Berhasil!', 
            text: modalMode === 'add' ? 'Jenis kemasan berhasil ditambah!' : 'Jenis kemasan berhasil diupdate!',
            timer: 2000,
            showConfirmButton: false,
        });

      } else {
        Swal.fire({
            icon: 'error', 
            title: 'Gagal!', 
            text: data.message,
            confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error submit:', error);
      Swal.fire({ icon: 'error', title: 'Kesalahan Server', text: 'Tidak dapat terhubung ke server API.' });
    }
  };


  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={28}/> Manajemen Kemasan
          </h2>
          <p className="text-gray-500 text-sm">Atur jenis kemasan beserta varian ukuran dan harganya.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> Tambah Jenis
        </button>
      </div>

      {/* Tabel Jenis Kemasan */}
      {isLoading ? (
        <div className="text-center py-8">Memuat data...</div>
      ) : types.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada jenis kemasan terdaftar.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-1/4">Jenis Kemasan</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Varian Ukuran & Harga</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center w-[150px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {types.map((type) => (
                <tr key={type._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800 align-top">
                    {type.name}
                    <div className="text-xs text-gray-400 font-normal mt-1">{type.description}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {/* Menampilkan Badges Varian */}
                    <div className="flex flex-wrap gap-2">
                      {type.sizes && type.sizes.map((s, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-medium">
                              {s.size} : Rp{s.price.toLocaleString('id-ID')}
                          </span>
                      ))}
                      {(!type.sizes || type.sizes.length === 0) && <span className="text-gray-400 italic text-sm">Tidak ada varian</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-3 align-top">
                    <button onClick={() => handleEdit(type)} className="text-blue-500 hover:text-blue-700" title="Edit">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(type._id)} className="text-red-500 hover:text-red-700" title="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-gray-800">
                {modalMode === 'add' ? 'Tambah Jenis Kemasan' : 'Edit Jenis Kemasan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Body Modal (Scrollable) */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jenis (Misal: Botol)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* --- INPUT DINAMIS UKURAN --- */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Varian Ukuran & Harga</label>
                
                <div className="space-y-3">
                    {formData.sizes.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    placeholder="Ukuran (Cth: 250ml)" 
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={item.size}
                                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-1/3 relative">
                                <span className="absolute left-3 top-2 text-gray-400 text-sm">Rp</span>
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    className="w-full pl-8 pr-2 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={item.price}
                                    onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                                    required
                                />
                            </div>
                            
                            {/* Tombol Hapus Baris */}
                            <button 
                                type="button" 
                                onClick={() => removeSizeField(index)} 
                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                title="Hapus baris ini"
                            >
                                <MinusCircle size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <button 
                    type="button" 
                    onClick={addSizeField}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                >
                    <PlusCircle size={16} /> Tambah Varian Lain
                </button>
              </div>
              {/* --------------------------- */}

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg">
                  {modalMode === 'add' ? 'Simpan Data' : 'Simpan Perubahan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PackagingTypeManagement;