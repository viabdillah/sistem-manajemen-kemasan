// client/src/pages/designer/DesignerQueuePage.jsx
import React, { useState, useEffect, useCallback } from "react";
// --- HAPUS: import { auth } from '../../firebaseConfig'; ---
import toast from "react-hot-toast";
import { BsCheckCircleFill } from "react-icons/bs";

// 1. Definisikan API_URL (tidak berubah)
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Komponen Detail Item (tidak berubah)
const ItemDetails = ({ items }) => (
  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
    {items.map((item) => (
      <li key={item.id}>
        <strong>{item.product_name}</strong> (Qty: {item.quantity})
        {!item.has_design ? (
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            Perlu Desain Baru
          </span>
        ) : (
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            Desain Siap
          </span>
        )}
        <div className="pl-5 text-xs text-gray-500">
          {item.label_name && `Label: ${item.label_name}`}
          {item.packaging_type && ` | Kemasan: ${item.packaging_type}`}
        </div>
      </li>
    ))}
  </ul>
);

const DesignerQueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const response = await fetch(`${API_URL}/api/desainer/queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil antrian desain");
      const data = await response.json();
      setQueue(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 4. Perbarui 'handleSendToProduction'
  const handleSendToProduction = async (orderId) => {
    const toastId = toast.loading("Mengirim ke operator produksi...");
    try {
      const token = getAuthToken(); // <-- Hapus 'await'

      const response = await fetch(
        `${API_URL}/api/desainer/send-to-production/${orderId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal mengirim");

      toast.success(data.message, { id: toastId });
      fetchData(); // Muat ulang data antrian
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  if (loading) return <div className="p-4">Loading data...</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Antrian Desain</h1>

      <div className="p-6 rounded-xl shadow-lg bg-yellow-100 text-yellow-800">
        <p className="text-sm font-medium">Pekerjaan Menunggu Konfirmasi</p>
        <p className="text-4xl font-bold">{queue.length}</p>
      </div>

      {/* Tabel Antrian (tidak berubah) */}
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
                Detail Item & Status Desain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queue.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada pekerjaan di antrian.
                </td>
              </tr>
            ) : (
              queue.map((order) => {
                const needsNewDesign = order.items.some(
                  (item) => !item.has_design
                );

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <ItemDetails items={order.items} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleSendToProduction(order.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow
                  text-white transition-colors
                 ${
                   needsNewDesign
                     ? "bg-blue-600 hover:bg-blue-700"
                     : "bg-green-600 hover:bg-green-700"
                 }`}
                      >
                        <BsCheckCircleFill />
                        {needsNewDesign
                          ? "Selesai Desain & Kirim"
                          : "Konfirmasi & Kirim"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesignerQueuePage;
