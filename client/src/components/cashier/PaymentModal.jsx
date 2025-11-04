// client/src/components/cashier/PaymentModal.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, onConfirm, order }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const toastId = toast.loading('Memproses pembayaran...');
    try {
      await onConfirm(order.order_id); // Panggil fungsi API dari parent
      toast.success('Pembayaran berhasil dicatat!', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Gagal memproses pembayaran', { id: toastId });
    } finally {
      setLoading(false);
      onClose(); // Tutup modal
    }
  };

  if (!isOpen || !order) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in"
          onClick={(e) => e.stopPropagation()} 
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Konfirmasi Pembayaran</h2>
          <p className="text-gray-600 mb-2">Anda akan mencatat pembayaran LUNAS untuk:</p>
          <ul className="mb-6 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
            <li><strong>No. Pesanan:</strong> {order.order_number}</li>
            <li><strong>Pelanggan:</strong> {order.customer_name}</li>
            <li className="font-bold text-lg"><strong>Total:</strong> Rp {Number(order.total_amount).toLocaleString('id-ID')}</li>
          </ul>
          
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Memproses...' : 'Konfirmasi & Bayar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;