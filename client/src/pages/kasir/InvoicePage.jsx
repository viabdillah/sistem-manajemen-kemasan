import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';

const InvoicePage = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [trans, setTrans] = useState(null);

  useEffect(() => {
    fetch(`/api/transactions/${transactionId}`)
      .then(res => res.json())
      .then(data => setTrans(data))
      .catch(err => console.error(err));
  }, [transactionId]);

  if (!trans) return <div className="p-10 text-center">Loading Invoice...</div>;

  // Tentukan Judul Nota Berdasarkan Status
  let notaTitle = "INVOICE / TAGIHAN";
  if (trans.status === 'Paid') notaTitle = "NOTA LUNAS";
  if (trans.status === 'Down Payment') notaTitle = "BUKTI PEMBAYARAN DP";

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      
      {/* Tombol Navigasi */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 print:hidden">
        <button onClick={() => navigate('/')} className="text-gray-600 flex items-center gap-1">
            <ArrowLeft size={18}/> Kembali ke Dashboard
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-blue-700">
            <Printer size={18}/> Cetak Nota
        </button>
      </div>

      {/* AREA KERTAS NOTA (Akan tercetak) */}
      <div className="bg-white w-full max-w-2xl p-8 shadow-2xl print:shadow-none text-gray-800 font-mono">
        
        {/* Header Nota */}
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold tracking-wider">{notaTitle}</h1>
            <p className="text-sm mt-1">KEMASANSYS - Pusat Layanan Kemasan</p>
            <p className="text-xs text-gray-500">Jl. Kemasan No. 123, Kota Bisnis</p>
        </div>

        {/* Info Transaksi */}
        <div className="flex justify-between mb-6 text-sm">
            <div>
                <p><span className="font-bold">No:</span> {trans.invoiceNumber}</p>
                <p><span className="font-bold">Tgl:</span> {new Date(trans.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
                <p><span className="font-bold">Pelanggan:</span></p>
                <p className="text-lg">{trans.customerId?.name}</p>
                <p className="text-xs">{trans.customerId?.phone}</p>
            </div>
        </div>

        {/* Tabel Item */}
        <table className="w-full text-sm mb-6">
            <thead className="border-b-2 border-gray-800">
                <tr>
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Total</th>
                </tr>
            </thead>
            <tbody>
                {trans.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2">
                            <div className="font-bold">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.packagingType} ({item.packagingSize})</div>
                        </td>
                        <td className="text-center py-2">{item.qty}</td>
                        <td className="text-right py-2">Rp {item.subtotal.toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Rincian Harga */}
        <div className="flex flex-col items-end space-y-2 border-t-2 border-gray-800 pt-4">
            <div className="flex justify-between w-1/2">
                <span className="font-bold">Total Tagihan:</span>
                <span className="font-bold">Rp {trans.totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="w-1/2 border-b border-gray-300 my-1"></div>

            {trans.payments.map((pay, idx) => (
                <div key={idx} className="flex justify-between w-1/2 text-sm text-gray-600">
                    <span>Bayar ({pay.method} - {pay.note}):</span>
                    <span>- Rp {pay.amount.toLocaleString()}</span>
                </div>
            ))}

            <div className="flex justify-between w-1/2 text-lg font-bold mt-2 pt-2 border-t border-dashed border-gray-400">
                <span>SISA BAYAR:</span>
                <span className="text-red-600">Rp {trans.remainingBalance.toLocaleString()}</span>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-400">
            <p>Terima kasih atas kepercayaan Anda.</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar kembali.</p>
            &copy; 2025 Manajemen Kemasan App
        </div>

      </div>
    </div>
  );
};

export default InvoicePage;