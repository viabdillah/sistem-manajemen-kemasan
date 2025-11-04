// client/src/pages/cashier/InvoicePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import InvoiceTemplate from '../../components/common/InvoiceTemplate.jsx';
import { useReactToPrint } from 'react-to-print';
import { BsPrinterFill, BsArrowLeft } from 'react-icons/bs';

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

const InvoicePage = () => {
  const { orderId } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef();

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // 2. Perbarui 'fetchInvoiceData'
  useEffect(() => {
    const fetchInvoiceData = async () => {
      setLoading(true);
      try {
        const token = await getAuthToken();
        // Perbarui panggilan fetch di sini
        const response = await fetch(`${API_URL}/api/kasir/orders/${orderId}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal mengambil data invoice');
        const data = await response.json();
        setInvoiceData(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceData();
  }, [orderId, getAuthToken]);

  // Fungsi Cetak (tidak berubah)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${invoiceData?.order_number || orderId}`
  });

  if (loading) return <div className="p-10 text-center">Memuat invoice...</div>;
  if (!invoiceData) return <div className="p-10 text-center text-red-500">Gagal memuat data invoice.</div>;

  return (
    <div className="p-4 md:p-6 animate-fade-in space-y-6">
      
      {/* Header Aksi (tidak berubah) */}
      <div className="flex justify-between items-center no-print">
        <Link 
          to="/kasir/pesanan"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg 
                     font-semibold hover:bg-gray-200 transition-colors"
        >
          <BsArrowLeft />
          Kembali ke Riwayat
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg 
                     font-semibold shadow-lg hover:bg-blue-700 transition-colors"
        >
          <BsPrinterFill />
          Cetak Invoice
        </button>
      </div>

      {/* Template Invoice (tidak berubah) */}
      <div className="print-area">
        <InvoiceTemplate data={invoiceData} />
      </div>
    </div>
  );
};

export default InvoicePage;