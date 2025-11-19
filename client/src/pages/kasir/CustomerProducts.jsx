import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Package, Edit, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../services/supabaseClient'; // Import Supabase

const CustomerProducts = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  // --- 1. FETCH DATA (READ) ---
  const fetchCustomerData = useCallback(async () => {
    setIsLoading(true);
    try {
      // A. Ambil Detail Pelanggan
      const { data: custData, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (custError) throw custError;
      setCustomer(custData);

      // B. Ambil Daftar Produk (Aktif / Tidak Deleted)
      // Perhatikan: Kolom di DB pakai snake_case (customer_id, is_deleted)
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;
      setProducts(prodData);
      
      // C. Ambil Data Master Kemasan
      const { data: packData, error: packError } = await supabase
        .from('packaging_types')
        .select('*');
      
      if (packError) throw packError;
      setPackagingTypesData(packData);

      setIsLoading(false);

    } catch (error) {
      console.error('Gagal mengambil data:', error.message);
      setIsLoading(false);
      Swal.fire('Error', 'Gagal memuat data.', 'error');
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);


  // --- LOGIKA DROPDOWN SIZE ---
  const selectedTypeObj = packagingTypesData.find(t => t.name === formData.packagingType);
  // Supabase mengembalikan JSONB 'sizes' sebagai array object biasa, jadi aman
  const availableSizes = selectedTypeObj && selectedTypeObj.sizes 
    ? selectedTypeObj.sizes.map(s => s.size) 
    : [];


  // --- 2. INSERT DATA (CREATE) ---
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    if (!formData.packagingType || !formData.packagingSize) {
        Swal.fire('Peringatan', 'Mohon pilih jenis dan ukuran kemasan.', 'warning');
        return;
    }

    try {
      // MAPPING DATA: camelCase (Form) -> snake_case (Database Supabase)
      const payload = {
        customer_id: customerId,
        product_name: formData.productName,
        product_label: formData.productLabel,
        nib: formData.nib,
        no_pirt: formData.noPirt,
        no_halal: formData.noHalal,
        packaging_type: formData.packagingType,
        packaging_size: formData.packagingSize
      };

      const { error } = await supabase
        .from('products')
        .insert([payload]);

      if (error) throw error;

      setIsModalOpen(false);
      // Reset Form
      setFormData({ productName: '', productLabel: '', nib: '', noPirt: '', noHalal: '', packagingType: '', packagingSize: '' }); 
      fetchCustomerData(); 
      
      Swal.fire({ icon: 'success', title: 'Produk Berhasil Ditambah!', timer: 1500, showConfirmButton: false });

    } catch (error) {
      console.error('Submit error:', error.message);
      Swal.fire({ icon: 'error', title: 'Gagal', text: error.message });
    }
  };

  // --- 3. SOFT DELETE ---
  const handleDelete = async (productId) => {
    const result = await Swal.fire({
        title: 'Hapus Produk?',
        text: "Produk akan dihapus.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus',
    });

    if (result.isConfirmed) {
        try {
            // Soft Delete: Update is_deleted = true
            const { error } = await supabase
                .from('products')
                .update({ is_deleted: true })
                .eq('id', productId);

            if (error) throw error;

            fetchCustomerData();
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
        } catch (error) {
            console.error(error);
            Swal.fire('Gagal', error.message, 'error');
        }
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
        {/* Ganti _id dengan id */}
        <p className="text-gray-500 mt-1 text-sm">ID: {customer.id}</p> 
      </div>

      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700">Daftar Produk ({products.length})</h3>
        <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition">
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="bg-yellow-50 p-6 rounded-xl text-yellow-800 border border-yellow-200">
            <p className="font-medium">Belum ada produk.</p>
          </div>
        ) : (
          products.map((product, index) => (
            <div key={product.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3 border-b pb-2">
                {/* Perhatikan penyesuaian nama kolom snake_case */}
                <h4 className="text-lg font-bold text-blue-700">{index + 1}. {product.product_name}</h4>
                <div className="flex space-x-2">
                  {/* Tombol Edit (Fitur Nanti) */}
                  <button className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button> 
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <DetailItem label="Label Produk" value={product.product_label} />
                <DetailItem label="Jenis Kemasan" value={product.packaging_type} />
                <DetailItem label="Ukuran" value={product.packaging_size} />
                <DetailItem label="No. Halal" value={product.no_halal} />
                <DetailItem label="NIB" value={product.nib} />
                <DetailItem label="No. PIRT" value={product.no_pirt} />
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Tambahkan Produk Baru</h3>
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
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS (TETAP DI BAWAH) ---

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