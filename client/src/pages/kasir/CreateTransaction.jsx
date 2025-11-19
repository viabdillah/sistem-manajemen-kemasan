import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Calculator, Save, ShoppingCart, FileImage, StickyNote } from 'lucide-react';
import Swal from 'sweetalert2';

const CreateTransaction = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  // Data States
  const [customer, setCustomer] = useState(null);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [packagingTypesData, setPackagingTypesData] = useState([]);

  // Cart (Item yang dipilih)
  const [cartItems, setCartItems] = useState([]);
  
  // Form Pembayaran States
  const [paymentType, setPaymentType] = useState('pay_later');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [payAmount, setPayAmount] = useState(0);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, prodRes, packRes] = await Promise.all([
            fetch(`/api/customers/${customerId}`),
            fetch(`/api/products/${customerId}`),
            fetch('/api/packaging-types')
        ]);
        
        setCustomer(await custRes.json());
        setCustomerProducts(await prodRes.json());
        setPackagingTypesData(await packRes.json());

      } catch (error) {
        console.error('Gagal load data:', error);
        Swal.fire('Error', 'Gagal memuat data transaksi', 'error');
      }
    };
    loadData();
  }, [customerId]);

  // --- 2. LOGIKA KERANJANG ---
  
  const addToCart = (product) => {
    const packType = packagingTypesData.find(p => p.name === product.packagingType);
    const packSize = packType?.sizes.find(s => s.size === product.packagingSize);
    const price = packSize ? packSize.price : 0;

    // Cek duplikasi
    const existingItemIndex = cartItems.findIndex(item => item.productId === product._id);

    if (existingItemIndex >= 0) {
        const newCart = [...cartItems];
        newCart[existingItemIndex].qty += 1;
        newCart[existingItemIndex].subtotal = newCart[existingItemIndex].qty * price;
        setCartItems(newCart);
    } else {
        const newItem = {
            productId: product._id,
            productName: product.productName,
            packagingType: product.packagingType,
            packagingSize: product.packagingSize,
            pricePerUnit: price,
            qty: 1,
            subtotal: price,
            // --- DATA DEFAULT BARU ---
            hasDesign: true, // Default: Sudah ada desain
            note: ''         // Default: Kosong
            // -------------------------
        };
        setCartItems([...cartItems, newItem]);
    }
  };

  // Fungsi umum untuk update field di dalam item cart
  const updateCartItem = (index, field, value) => {
    const newCart = [...cartItems];
    newCart[index][field] = value;
    
    // Jika yang diubah qty, hitung ulang subtotal
    if (field === 'qty') {
        const qty = parseInt(value) || 0;
        if (qty < 0) return;
        newCart[index].qty = qty;
        newCart[index].subtotal = qty * newCart[index].pricePerUnit;
    }

    setCartItems(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
  };

  // --- 3. KALKULASI TOTAL ---
  const totalTagihan = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  useEffect(() => {
    if (paymentType === 'full') {
      setPayAmount(totalTagihan);
    } else if (paymentType === 'pay_later') {
      setPayAmount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentType, totalTagihan]);


  // --- 4. SUBMIT TRANSAKSI ---
  const handleCreateTransaction = async () => {
    if (cartItems.length === 0) return Swal.fire('Keranjang Kosong', 'Pilih minimal satu produk.', 'warning');
    if (paymentType === 'dp' && payAmount <= 0) return Swal.fire('Nominal Salah', 'Nominal DP tidak boleh 0.', 'warning');
    if (payAmount > totalTagihan) return Swal.fire('Nominal Salah', 'Pembayaran melebihi total tagihan.', 'warning');

    const payload = {
        customerId,
        items: cartItems,
        firstPayment: {
            amount: payAmount,
            method: paymentMethod,
            note: paymentType === 'full' ? 'Lunas Awal' : (paymentType === 'dp' ? 'Down Payment' : '')
        }
    };

    try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (res.ok) {
            Swal.fire({
                title: 'Transaksi Berhasil!',
                text: `No. Invoice: ${data.transaction.invoiceNumber}`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                navigate(`/invoice/${data.transaction._id}`);
            });
        } else {
            Swal.fire('Gagal', data.message, 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        Swal.fire('Error', 'Gagal memproses pesanan.', 'error');
    }
  };

  if (!customer) return <div className="p-10 text-center text-gray-500">Memuat data transaksi...</div>;

  return (
    <div className="space-y-6 pb-24">
        
        {/* Header */}
        <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 transition">
                <ChevronLeft size={24}/>
            </button>
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Buat Pesanan Baru</h2>
                <p className="text-sm text-gray-500">Pelanggan: <span className="font-semibold text-blue-600">{customer.name}</span></p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- KOLOM KIRI (PRODUK & KERANJANG) --- */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Daftar Produk Pelanggan */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <ShoppingCart size={20}/> Pilih Produk
                    </h3>
                    
                    {customerProducts.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">Pelanggan ini belum memiliki produk terdaftar.</p>
                            <button 
                                onClick={() => navigate(`/customers/${customerId}/products`)}
                                className="text-blue-600 font-medium text-sm mt-2 hover:underline"
                            >
                                + Tambah Produk Dulu
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {customerProducts.map(prod => (
                                <div 
                                    key={prod._id} 
                                    onClick={() => addToCart(prod)}
                                    className="border border-gray-200 p-3 rounded-lg flex justify-between items-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition group" 
                                >
                                    <div>
                                        <p className="font-bold text-gray-800 group-hover:text-blue-700">{prod.productName}</p>
                                        <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">{prod.packagingType}</span>
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">{prod.packagingSize}</span>
                                        </div>
                                    </div>
                                    <button className="bg-blue-100 text-blue-600 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                                        <Plus size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Keranjang Belanja (UPDATE UI) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4">Rincian Pesanan</h3>
                    
                    {cartItems.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                            Belum ada item yang dipilih.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                                    
                                    {/* Baris Atas: Nama Produk & Harga & Hapus */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{item.productName}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.packagingType} ({item.packagingSize})
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-400">@ Rp{item.pricePerUnit.toLocaleString()}</p>
                                                <p className="font-bold text-blue-700">Rp {item.subtotal.toLocaleString()}</p>
                                            </div>
                                            <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Baris Bawah: Input Detail (Qty, Desain, Note) */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                                        
                                        {/* Input Qty */}
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Jumlah</label>
                                            <input 
                                                type="number" 
                                                className="w-full border rounded-md p-1.5 text-center font-bold outline-none focus:border-blue-500"
                                                value={item.qty}
                                                onChange={(e) => updateCartItem(idx, 'qty', e.target.value)}
                                                min="1"
                                            />
                                        </div>

                                        {/* Pilihan Desain */}
                                        <div className="md:col-span-4">
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1">
                                                <FileImage size={12}/> Status Desain
                                            </label>
                                            <select 
                                                className={`w-full border rounded-md p-1.5 text-sm outline-none focus:border-blue-500 ${item.hasDesign ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}
                                                value={item.hasDesign}
                                                onChange={(e) => updateCartItem(idx, 'hasDesign', e.target.value === 'true')}
                                            >
                                                <option value="true">Sudah Ada Desain</option>
                                                <option value="false">Belum Ada Desain</option>
                                            </select>
                                        </div>

                                        {/* Input Keterangan */}
                                        <div className="md:col-span-6">
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1">
                                                <StickyNote size={12}/> Keterangan
                                            </label>
                                            <input 
                                                type="text" 
                                                className="w-full border rounded-md p-1.5 text-sm outline-none focus:border-blue-500"
                                                placeholder="Cth: Laminasi doff, tambah logo..."
                                                value={item.note}
                                                onChange={(e) => updateCartItem(idx, 'note', e.target.value)}
                                            />
                                        </div>

                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Subtotal Bar */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-gray-600 font-medium text-lg">Total Tagihan</span>
                        <span className="text-2xl font-bold text-blue-700">Rp {totalTagihan.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* --- KOLOM KANAN (PEMBAYARAN) --- */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 sticky top-6">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
                        <Calculator size={20} className="text-blue-600"/> Pembayaran
                    </h3>

                    {/* Opsi Bayar */}
                    <div className="space-y-2 mb-5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Opsi Bayar</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            value={paymentType}
                            onChange={(e) => {
                                const type = e.target.value;
                                setPaymentType(type);
                                if (type === 'dp' || type === 'pay_later') setPayAmount(0);
                            }}
                        >
                            <option value="pay_later">Bayar Nanti (Saat Ambil)</option>
                            <option value="dp">Down Payment (DP)</option>
                            <option value="full">Lunas Sekarang</option>
                        </select>
                    </div>

                    {/* Metode Pembayaran */}
                    {paymentType !== 'pay_later' && (
                        <div className="space-y-2 mb-5 animate-fade-in">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Metode Bayar</label>
                             <div className="flex gap-3">
                                <button 
                                    className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${paymentMethod === 'Cash' ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => setPaymentMethod('Cash')}
                                >
                                    Tunai
                                </button>
                                <button 
                                    className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${paymentMethod === 'Transfer' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    onClick={() => setPaymentMethod('Transfer')}
                                >
                                    Transfer
                                </button>
                             </div>
                        </div>
                    )}

                    {/* Input Nominal */}
                    {paymentType !== 'pay_later' && (
                        <div className="mb-6 animate-fade-in">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                {paymentType === 'dp' ? 'Nominal DP (Rp)' : 'Total Bayar (Rp)'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-400 font-bold">Rp</span>
                                <input 
                                    type="number" 
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl font-bold text-lg text-right outline-none focus:ring-2 focus:ring-blue-500 ${paymentType === 'full' ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-800'}`}
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(Number(e.target.value))}
                                    disabled={paymentType === 'full'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Rincian Akhir */}
                    <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-3 mb-6 border border-gray-100">
                        <div className="flex justify-between text-gray-600">
                            <span>Tagihan</span>
                            <span>{totalTagihan.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-bold">
                            <span>Bayar Sekarang</span>
                            <span>- {parseInt(payAmount).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-dashed border-gray-300 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700">Sisa Tagihan</span>
                                <span className="text-lg font-bold text-red-500">Rp {(totalTagihan - payAmount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleCreateTransaction}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 flex justify-center items-center gap-2 transition transform active:scale-95"
                    >
                        <Save size={20}/> Proses Pesanan
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CreateTransaction;