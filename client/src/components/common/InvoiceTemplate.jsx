// client/src/components/common/InvoiceTemplate.jsx
import React from 'react'; // Hanya perlu React

// (Fungsi helper formatDate dan formatCurrency)
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const formatCurrency = (number) => new Number(number).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

// KEMBALIKAN KE KOMPONEN FUNGSI BIASA (bukan forwardRef)
const InvoiceTemplate = ({ data }) => {
  if (!data) return <p>Memuat data invoice...</p>;

  // (Kalkulasi subtotal dan total)
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price_per_pcs), 0);
  const total = data.total_amount;

  return (
    // TIDAK PERLU 'ref' lagi
    <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 max-w-3xl mx-auto">
      {/* ... (Semua kode template invoice Anda di sini) ... */}
      {/* ... (Header, Info Pelanggan, Tabel Item, Footer Total) ... */}
       <div className="flex justify-between items-center border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-600 font-semibold">{data.order_number}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">Pusat Layanan Kemasan Sintesa</p>
          <p className="text-sm text-gray-500">M63M+652, Jl. Soekarno-Hatta, Kaduagung Tengah, Kec. Cibadak</p>
          <p className="text-sm text-gray-500">Kabupaten Lebak, Banten 42317, Indonesia</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Ditagih Kepada:</p>
          <p className="text-lg font-semibold text-gray-800">{data.customer_name}</p>
          <p className="text-gray-600">{data.customer_email}</p>
          <p className="text-gray-600">{data.customer_phone}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-500 uppercase">Tanggal Pesan:</p>
          <p className="text-gray-700 font-medium">{formatDate(data.created_at)}</p>
          <p className="text-sm font-semibold text-gray-500 uppercase mt-4">Kasir:</p>
          <p className="text-gray-700 font-medium">{data.cashier_name}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                  <p className="text-xs text-gray-600">
                    {item.label_name || 'Tanpa Label'} ({item.packaging_type || 'N/A'})
                  </p>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-600">{item.quantity}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-600">{formatCurrency(item.price_per_pcs)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">
                  {formatCurrency(item.quantity * item.price_per_pcs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-8">
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-gray-600">
            <p>Subtotal:</p>
            <p>{formatCurrency(subtotal)}</p>
          </div>
          <div className="border-t my-2"></div>
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <p>Total:</p>
            <p>{formatCurrency(total)}</p>
          </div>
          <div className="mt-4 text-right">
            {data.payment_status === 'paid' ? (
              <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-full text-sm">
                LUNAS
              </span>
            ) : (
              <span className="px-4 py-2 bg-red-100 text-red-800 font-semibold rounded-full text-sm">
                BELUM LUNAS
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;