// client/src/pages/operator/OperatorQueuePage.jsx
import React, { useState, useEffect, useCallback } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import toast from "react-hot-toast";
import MaterialReductionModal from "../../components/operator/MaterialReductionModal.jsx";

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const OperatorQueuePage = () => {
  const [queue, setQueue] = useState([]); // Menunggu (production_queue)
  const [inProgress, setInProgress] = useState([]); // Sedang dikerjakan (in_production)
  const [materials, setMaterials] = useState([]); // Daftar bahan untuk modal
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // --- 2. GANTI LOGIKA getAuthToken ---
  // Gunakan JWT dari localStorage
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Anda tidak terautentikasi (Token tidak ada)");
    return token;
  }, []);

  // 3. Perbarui 'fetchData'
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken(); // <-- Hapus 'await'
      const headers = { Authorization: `Bearer ${token}` };

      // 2a. Ambil Antrian Menunggu
      const queueRes = await fetch(`${API_URL}/api/operator/queue`, {
        headers,
      });
      if (!queueRes.ok) throw new Error("Gagal mengambil antrian produksi");
      const queueData = await queueRes.json();
      setQueue(queueData);

      // 2b. Ambil Antrian Sedang Dikerjakan
      const inProgressRes = await fetch(`${API_URL}/api/operator/in-progress`, {
        headers,
      });
      if (!inProgressRes.ok)
        throw new Error("Gagal mengambil antrian sedang dikerjakan");
      const inProgressData = await inProgressRes.json();
      setInProgress(inProgressData);

      // 2c. Ambil Daftar Bahan (untuk modal)
      // Kita asumsikan token ini juga memiliki izin 'isInventoryManager'
      const materialsRes = await fetch(`${API_URL}/api/inventory/materials`, {
        headers,
      });
      if (!materialsRes.ok) throw new Error("Gagal mengambil daftar bahan");
      const materialsData = await materialsRes.json();
      setMaterials(materialsData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Fungsi Aksi ---
  const handleOpenModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  // 4. Perbarui 'handleFinishProduction'
  const handleFinishProduction = async (orderId) => {
    const toastId = toast.loading("Menyelesaikan produksi...");
    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(
        `${API_URL}/api/operator/finish/${orderId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal menyelesaikan");

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

      {/* Tabel 1: Menunggu Produksi */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-700">
          Menunggu Produksi ({queue.length})
        </h2>
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No. Pesanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tgl. Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queue.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Antrian produksi kosong.
                  </td>
                </tr>
              ) : (
                queue.map((order) => (
                  // --- 5. GANTI 'order.id' ke 'order._id' ---
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleOpenModal(order._id)} // <-- Ganti ke _id
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

      {/* Tabel 2: Sedang Produksi */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-700">
          Sedang Produksi ({inProgress.length})
        </h2>
        <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No. Pesanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tgl. Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inProgress.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Tidak ada pesanan yang sedang diproduksi.
                  </td>
                </tr>
              ) : (
                inProgress.map((order) => (
                  // --- 5. GANTI 'order.id' ke 'order._id' ---
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleFinishProduction(order._id)} // <-- Ganti ke _id
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
