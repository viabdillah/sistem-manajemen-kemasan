// client/src/pages/operator/OperatorQueuePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import MaterialReductionModal from '../../components/operator/MaterialReductionModal.jsx';

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

const OperatorQueuePage = () => {
  const [queue, setQueue] = useState([]); // Menunggu (production_queue)
  const [inProgress, setInProgress] = useState([]); // Sedang dikerjakan (in_production)
  const [materials, setMaterials] = useState([]); // Daftar bahan untuk modal
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
      const headers = { Authorization: `Bearer ${token}` };

      // 2a. Ambil Antrian Menunggu
      const queueRes = await fetch(`${API_URL}/api/operator/queue`, { headers });
      if (!queueRes.ok) throw new Error('Gagal mengambil antrian produksi');
      const queueData = await queueRes.json();
      setQueue(queueData);

      // 2b. Ambil Antrian Sedang Dikerjakan
      const inProgressRes = await fetch(`${API_URL}/api/operator/in-progress`, { headers });
      if (!inProgressRes.ok) throw new Error('Gagal mengambil antrian sedang dikerjakan');
      const inProgressData = await inProgressRes.json();
      setInProgress(inProgressData);

      // 2c. Ambil Daftar Bahan (untuk modal)
      const materialsRes = await fetch(`${API_URL}/api/inventory/materials`, { headers });
      if (!materialsRes.ok) throw new Error('Gagal mengambil daftar bahan');
      const materialsData = await materialsRes.json();
      setMaterials(materialsData);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]); // Hapus API_URL dari dependensi

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Fungsi Aksi ---
  const handleOpenModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  // 3. Perbarui 'handleFinishProduction'
  const handleFinishProduction = async (orderId) => {
    const toastId = toast.loading('Menyelesaikan produksi...');
    try {
      const token = await getAuthToken();
      // Perbarui panggilan fetch
      const response = await fetch(`${API_URL}/api/operator/finish/${orderId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal menyelesaikan');
      
      toast.success(data.message, { id: toastId });
      fetchData(); // Muat ulang kedua tabel
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  if (loading) return <div className="p-4">Loading data...</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Antrian Produksi</h1>
      
      {/* Tabel 1: Menunggu Produksi (tidak berubah) */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-700">Menunggu Produksi ({queue.length})</h2>
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* (Header Tabel) */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Pesanan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl. Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queue.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Antrian produksi kosong.</td></tr>
              ) : (
                queue.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleOpenModal(order.id)}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow hover:bg-blue-700"
                      >
                        Proses Produksi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel 2: Sedang Produksi (tidak berubah) */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-700">Sedang Produksi ({inProgress.length})</h2>
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* (Header Tabel) */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Pesanan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl. Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inProgress.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Tidak ada pesanan yang sedang diproduksi.</td></tr>
              ) : (
                inProgress.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleFinishProduction(order.id)}
                        className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg shadow hover:bg-green-700"
                      >
                        Selesai Produksi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pengurangan Stok (tidak berubah) */}
      <MaterialReductionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={fetchData}
        orderId={selectedOrderId}
        materialsList={materials}
      />
    </div>
  );
};

export default OperatorQueuePage;