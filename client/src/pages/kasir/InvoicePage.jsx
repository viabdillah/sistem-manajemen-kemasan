import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { supabase } from '../../services/supabaseClient'; // Import Supabase

const InvoicePage = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [trans, setTrans] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // JOIN table transactions dengan customers
        const { data, error } = await supabase
          .from('transactions')
          .select('*, customers(*)') // Ambil data transaksi + data customer terkait
          .eq('id', transactionId)
          .single();

        if (error) throw error;
        setTrans(data);
      } catch (error) {
        console.error('Error fetching invoice:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [transactionId]);

  if (isLoading) return <div className="p-10 text-center">Memuat Nota...</div>;
  if (!trans) return <div className="p-10 text-center text-red-500">Nota tidak ditemukan.</div>;

  // Tentukan Judul Nota
  let notaTitle = "INVOICE / TAGIHAN";
  if (trans.status === 'Paid') notaTitle = "NOTA LUNAS";
  if (trans.status === 'Down Payment') notaTitle = "BUKTI PEMBAYARAN DP";

  // Hitung Sisa Bayar (Total - Yang Sudah Dibayar)
  const remaining = trans.total_amount - trans.total_paid;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      
      {/* Tombol Navigasi (Tidak ikut tercetak) */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 print:hidden">
        <button 
          onClick={() => navigate('/')} 
          className="text-gray-600 flex items-center gap-1 hover:text-blue-600 transition"
        >
            <ArrowLeft size={18}/> Kembali ke Dashboard
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-blue-700 transition"
        >
            <Printer size={18}/> Cetak Nota
        </button>
      </div>

      {/* AREA KERTAS NOTA */}
      <div className="bg-white w-full max-w-2xl p-8 shadow-2xl print:shadow-none text-gray-800 font-mono border border-gray-200 print:border-none">
        
        {/* Header Nota */}
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold tracking-wider text-slate-800">{notaTitle}</h1>
            <p className="text-sm mt-1 font-bold">KemasanSYS Pusat Layanan Kemasan</p>
            <p className="text-xs text-gray-500">M63M+652, Jl. Soekarno-Hatta, Kaduagung Tengah, Kec. Cibadak, Kabupaten Lebak, Banten 42317</p>
            <p className="text-xs text-gray-500">Telp: 085183043381</p>
        </div>

        {/* Info Transaksi */}
        <div className="flex justify-between mb-6 text-sm">
            <div>
                <p className="mb-1"><span className="font-bold">No. Inv :</span> {trans.invoice_number}</p>
                <p><span className="font-bold">Tanggal :</span> {new Date(trans.created_at).toLocaleDateString('id-ID')}</p>
                <p><span className="font-bold">Jam     :</span> {new Date(trans.created_at).toLocaleTimeString('id-ID')}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-gray-400 text-xs uppercase">Kepada Yth:</p>
                <p className="text-lg font-bold">{trans.customers?.name}</p>
                <p className="text-xs">{trans.customers?.phone}</p>
            </div>
        </div>

        {/* Tabel Item */}
        <table className="w-full text-sm mb-6">
            <thead className="border-b-2 border-gray-800">
                <tr>
                    <th className="text-left py-2">Item Description</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {/* Item diambil dari kolom JSONB 'items' */}
                {trans.items && trans.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3">
                            <div className="font-bold">{item.productName}</div>
                            <div className="text-xs text-gray-500">
                                {item.packagingType} - {item.packagingSize}
                            </div>
                            {item.note && <div className="text-xs italic text-gray-400">"{item.note}"</div>}
                        </td>
                        <td className="text-center py-3 align-top">{item.qty}</td>
                        <td className="text-right py-3 align-top">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Rincian Harga */}
        <div className="flex flex-col items-end space-y-2 border-t-2 border-gray-800 pt-4">
            <div className="flex justify-between w-1/2 text-lg">
                <span className="font-bold">Total Tagihan:</span>
                <span className="font-bold">Rp {trans.total_amount.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="w-1/2 border-b border-gray-300 my-2"></div>

            {/* Riwayat Pembayaran dari kolom JSONB 'payments' */}
            {trans.payments && trans.payments.map((pay, idx) => (
                <div key={idx} className="flex justify-between w-1/2 text-sm text-gray-600">
                    <span>
                        {new Date(pay.date).toLocaleDateString('id-ID')} ({pay.method} - {pay.note}):
                    </span>
                    <span>- Rp {parseInt(pay.amount).toLocaleString('id-ID')}</span>
                </div>
            ))}

            <div className="flex justify-between w-1/2 text-xl font-black mt-4 pt-3 border-t border-dashed border-gray-400">
                <span>SISA BAYAR:</span>
                <span className={`${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Rp {remaining.toLocaleString('id-ID')}
                </span>
            </div>
        </div>

        {/* Footer / Terms */}
        <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
            <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
            <p>Komplain hasil cetak maksimal 1x24 jam setelah pengambilan.</p>
            <p className="mt-2 font-bold text-gray-300">Powered by KemasanSys Pusat Layanan Kemasan</p>
        </div>

      </div>
    </div>
  );
};

export default InvoicePage;