// client/src/pages/inventory/StockOpnamePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import { BsPlusCircleFill } from 'react-icons/bs';
import AddMaterialModal from '../../components/inventory/AddMaterialModal.jsx';
import AddStockModal from '../../components/inventory/AddStockModal.jsx';

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

const StockOpnamePage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // 2. Perbarui 'fetchData'
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      // Perbarui panggilan fetch
      const response = await fetch(`${API_URL}/api/inventory/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data bahan');
      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]); // Hapus API_URL dari dependensi

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSuccess = () => {
    fetchData(); // Refresh tabel setelah ada data baru
  };

  if (loading) return <div className="p-4">Loading data...</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      {/* 1. Header Halaman (tidak berubah) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Stok Bahan (Stock Opname)</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsMaterialModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                       font-semibold shadow-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <BsPlusCircleFill />
            Bahan Baru
          </button>
          <button
            onClick={() => setIsStockModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg 
                       font-semibold shadow-lg hover:bg-green-700 transition-colors text-sm"
          >
            <BsPlusCircleFill />
            Tambah Stok
          </button>
        </div>
      </div>

      {/* 2. Tabel Stok Bahan (tidak berubah) */}
      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Bahan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ukuran</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Belum ada bahan baku.</td></tr>
            ) : (
              materials.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.type || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.size || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {m.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Modals (tidak berubah) */}
      <AddMaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
      />
      <AddStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
        materials={materials} 
      />
    </div>
  );
};

export default StockOpnamePage;