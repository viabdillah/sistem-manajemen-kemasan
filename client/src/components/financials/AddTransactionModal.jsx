// client/src/components/financials/AddTransactionModal.jsx
import React, { useState, useCallback } from 'react';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddTransactionModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [type, setType] = useState('pemasukan');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // 2. Perbarui 'handleSubmit'
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Menyimpan transaksi...');

    try {
      const token = await getAuthToken();
      // Perbarui panggilan fetch
      const response = await fetch(`${API_URL}/api/keuangan/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, description, amount: Number(amount) })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal menyimpan');

      toast.success(data.message, { id: toastId });
      onSaveSuccess();
      setDescription('');
      setAmount(0);
      setType('pemasukan');
      onClose();
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in"
          onClick={(e) => e.stopPropagation()} 
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Catat Transaksi Manual</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... (Input fields tidak berubah) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Transaksi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              >
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Keterangan</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Batal
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTransactionModal;