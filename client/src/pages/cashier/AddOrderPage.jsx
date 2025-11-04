// client/src/pages/cashier/AddOrderPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import OrderItemForm from '../../components/cashier/OrderItemForm.jsx';
import { BsPlusLg } from 'react-icons/bs';

// 1. Definisikan API_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Objek template (tidak berubah)
const newBlankItem = {
  product_name: '', label_name: '', pirt_number: '', halal_number: '',
  has_design: true, packaging_type: '', quantity: 1, price_per_pcs: 0, notes: ''
};

const AddOrderPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{...newBlankItem}]);
  const navigate = useNavigate();

  const getAuthToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Anda tidak terautentikasi');
    return await user.getIdToken();
  }, []);

  // 2. Perbarui 'fetchCustomers'
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = await getAuthToken();
        // Perbarui panggilan fetch di sini
        const response = await fetch(`${API_URL}/api/kasir/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal mengambil data pelanggan');
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchCustomers();
  }, [getAuthToken]);

  const handleItemChange = (index, updatedItemData) => {
    const newItems = [...items];
    newItems[index] = updatedItemData;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { ...newBlankItem }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price_per_pcs) || 0;
      return total + (qty * price);
    }, 0);
  }, [items]);

  // 3. Perbarui 'handleSubmit'
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Silakan pilih pelanggan terlebih dahulu.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Membuat pesanan...');

    const orderData = {
      customer_id: Number(customerId),
      total_amount: totalAmount,
      // Hapus payment/notes jika sudah Anda hapus sebelumnya
      items: items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        price_per_pcs: Number(item.price_per_pcs)
      }))
    };

    try {
      const token = await getAuthToken();
      // Perbarui panggilan fetch di sini
      const response = await fetch(`${API_URL}/api/kasir/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal membuat pesanan');
      
      toast.success(data.message, { id: toastId });
      navigate('/kasir/pesanan');
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- Layout JSX (Tetap sama, hanya logika 'fetch' yang berubah) ---
  return (
    <div className="animate-fade-in h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 px-4 md:px-6 pt-4 md:pt-6">
        Buat Pesanan Baru
      </h1>
      
      <form 
        onSubmit={handleSubmit} 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-6 pb-6"
      >
        
        {/* Kolom Kanan/Atas (Detail Pesanan) */}
        <div className="lg:col-span-1 space-y-6 lg:order-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white shadow-lg rounded-xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">Detail Pesanan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pilih Pelanggan <span className="text-red-500">*</span></label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
                  >
                    <option value="" disabled>-- Pilih Pelanggan --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.whatsapp_number})</option>
                    ))}
                  </select>
                </div>
                {/* Field Pembayaran sudah dihapus sesuai revisi sebelumnya */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Kolom Kiri/Bawah (Form Item) */}
        <div className="lg:col-span-2 lg:order-1 space-y-6 overflow-y-auto lg:h-[calc(100vh-160px)] pr-2 pb-10">
          
          {items.map((item, index) => (
            <OrderItemForm
              key={index}
              index={index}
              itemData={item}
              onItemChange={handleItemChange}
              onRemoveItem={handleRemoveItem}
            />
          ))}

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-lg 
                         font-semibold shadow-lg hover:bg-green-600 transition-colors"
            >
              <BsPlusLg />
              Tambah Item Lain
            </button>
          </div>

          {/* Total & Submit */}
          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 mt-6">
            <div className="text-right">
              <p className="text-lg text-gray-600">Total Harga:</p>
              <p className="text-4xl font-bold text-gray-900">
                Rp {totalAmount.toLocaleString('id-ID')}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg shadow-md
                         hover:bg-blue-700 transition-colors duration-300
                         disabled:bg-gray-400"
            >
              {loading ? 'Memproses...' : 'Proses Pesanan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddOrderPage;