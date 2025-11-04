// client/src/pages/designer/DesignerHistoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Komponen chip status (tidak berubah)
const getStatusChip = (status) => {
  switch (status) {
    case 'design_review':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Review Desain</span>;
    case 'production_queue':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Produksi</span>;
    case 'completed':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
    case 'cancelled':
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 line-through">Batal</span>;
    default:
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
};

const DesignerHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // 2. Perbarui 'fetchData'
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getAuthToken();
        // Perbarui panggilan fetch
        const response = await fetch(`${API_URL}/api/desainer/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal mengambil riwayat desain');
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAuthToken]); // Hapus API_URL dari dependensi

  if (loading) return <div className="p-4">Loading data...</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Riwayat Desain</h1>
      
      {/* Tabel Riwayat (tidak berubah) */}
      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Pesanan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Tidak ada riwayat desain.</td></tr>
            ) : (
              history.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusChip(order.order_status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesignerHistoryPage;