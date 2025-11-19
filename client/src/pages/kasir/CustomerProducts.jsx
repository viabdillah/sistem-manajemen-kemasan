import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Package, Edit, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

const CustomerProducts = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  // STATES
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null); // ID produk yg diedit

  // Data Master Jenis Kemasan
  const [packagingTypesData, setPackagingTypesData] = useState([]); 
  
  const [formData, setFormData] = useState({
    productName: '',
    productLabel: '',
    nib: '',
    noPirt: '',
    noHalal: '',
    packagingType: '',
    packagingSize: ''
  });

  // --- FETCH DATA ---
  const fetchCustomerData = useCallback(async () => {
    setIsLoading(true);
    try {
      const customerRes = await fetch(`${import.meta.env.VITE_API_URL}/api/customers/${customerId}`);
      const customerData = await customerRes.json();
      setCustomer(customerData);

      const productRes = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${customerId}`);
      const productData = await productRes.json();
      setProducts(productData);
      
      const packagingRes = await fetch('${import.meta.env.VITE_API_URL}/api/packaging-types');
      const packagingRaw = await packagingRes.json();
      setPackagingTypesData(packagingRaw);

      setIsLoading(false);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      setIsLoading(false);
      Swal.fire('Error', 'Gagal memuat data.', 'error');
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // --- LOGIKA DROPDOWN ---
  const selectedTypeObj = packagingTypesData.find(t => t.name === formData.packagingType);
  const availableSizes = selectedTypeObj ? selectedTypeObj.sizes.map(s => s.size) : [];

  // --- HANDLERS ---

  const openAddModal = () => {
    setModalMode('add');
    setSelectedProductId(null);
    setFormData({ productName: '', productLabel: '', nib: '', noPirt: '', noHalal: '', packagingType: '', packagingSize: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setSelectedProductId(product._id);
    setFormData({
        productName: product.productName,
        productLabel: product.productLabel,
        nib: product.nib,
        noPirt: product.noPirt,
        noHalal: product.noHalal,
        packagingType: product.packagingType,
        packagingSize: product.packagingSize
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus Produk?',
        text: "Produk akan dihapus dari daftar aktif (Soft Delete).",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchCustomerData();
                Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
            } else {
                Swal.fire('Gagal', 'Gagal menghapus produk', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            Swal.fire('Error', 'Kesalahan koneksi server', 'error');
        }
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.packagingType || !formData.packagingSize) {
        Swal.fire('Peringatan', 'Mohon pilih jenis dan ukuran kemasan.', 'warning');
        return;
    }

    try {
      const payload = { customerId, ...formData };
      
      // Tentukan URL dan Method berdasarkan Mode
      const url = modalMode === 'add' 
        ? '${import.meta.env.VITE_API_URL}/api/products' 
        : `${import.meta.env.VITE_API_URL}/api/products/${selectedProductId}`;
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        fetchCustomerData(); 
        Swal.fire({ 
            icon: 'success', 
            title: modalMode === 'add' ? 'Produk Ditambah!' : 'Produk Diupdate!', 
            timer: 1500, 
            showConfirmButton: false 
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: data.message });
      }
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({ icon: 'error', title: 'Kesalahan Server', text: 'Gagal menyimpan produk.' });
    }
  };

  if (isLoading) return <div className="text-center py-10">Memuat data...</div>;
  if (!customer) return <div className="text-center py-10 text-red-500">Pelanggan tidak ditemukan.</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/customers')} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition">
        <ChevronLeft size={20} /> Kembali ke Daftar Pelanggan
      </button>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={30} className="text-blue-600"/> Produk: {customer.name}
        </h2>
        <p className="text-gray-500 mt-1 text-sm">ID: {customerId}</p>
      </div>

      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700">Daftar Produk ({products.length})</h3>
        <button onClick={openAddModal} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition">
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="bg-yellow-50 p-6 rounded-xl text-yellow-800 border border-yellow-200">
            <p className="font-medium">Belum ada produk aktif.</p>
          </div>
        ) : (
          products.map((product, index) => (
            <div key={product._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition relative">
              <div className="flex justify-between items-start mb-3 border-b pb-2">
                <h4 className="text-lg font-bold text-blue-700">{index + 1}. {product.productName}</h4>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(product)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit">
                    <Edit size={18}/>
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 p-1" title="Hapus (Soft Delete)">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <DetailItem label="Label Produk" value={product.productLabel} />
                <DetailItem label="Jenis Kemasan" value={product.packagingType} />
                <DetailItem label="Ukuran" value={product.packagingSize} />
                <DetailItem label="No. Halal" value={product.noHalal} />
                <DetailItem label="NIB" value={product.nib} />
                <DetailItem label="No. PIRT" value={product.noPirt} />
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {modalMode === 'add' ? 'Tambahkan Produk Baru' : 'Edit Produk'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nama Produk" name="productName" value={formData.productName} onChange={setFormData} required={true} />
                <InputField label="Label Produk" name="productLabel" value={formData.productLabel} onChange={setFormData} required={true} />
                <InputField label="NIB" name="nib" value={formData.nib} onChange={setFormData} />
                <InputField label="No. PIRT" name="noPirt" value={formData.noPirt} onChange={setFormData} />
                <InputField label="No. Halal" name="noHalal" value={formData.noHalal} onChange={setFormData} />
                
                {/* 1. DROPDOWN JENIS KEMASAN */}
                <SelectField 
                    label="Jenis Kemasan" 
                    name="packagingType" 
                    value={formData.packagingType} 
                    onChange={(updater) => {
                        setFormData(prev => {
                            const newState = updater(prev);
                            return { ...newState, packagingSize: '' }; 
                        });
                    }}
                    options={packagingTypesData.map(t => t.name)}
                    required={true} 
                />
                
                {/* 2. DROPDOWN UKURAN KEMASAN */}
                <SelectField 
                    label="Ukuran Kemasan" 
                    name="packagingSize" 
                    value={formData.packagingSize} 
                    onChange={setFormData} 
                    options={availableSizes}
                    required={true} 
                    disabled={!formData.packagingType}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg">
                    {modalMode === 'add' ? 'Simpan' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---
const DetailItem = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-100 pb-1">
        <span className="text-gray-500 font-medium">{label}:</span>
        <span className="text-gray-700 font-semibold">{value || '—'}</span>
    </div>
);

const InputField = ({ label, name, value, onChange, required, type = 'text' }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
        <input 
            type={type} 
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required={required}
            value={value}
            onChange={(e) => onChange(prev => ({...prev, [name]: e.target.value}))}
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options, required, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
        <select 
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
            value={value}
            onChange={(e) => onChange(prev => ({...prev, [name]: e.target.value}))}
            required={required}
            disabled={disabled}
        >
            <option value="" disabled>-- Pilih --</option>
            {options.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default CustomerProducts;