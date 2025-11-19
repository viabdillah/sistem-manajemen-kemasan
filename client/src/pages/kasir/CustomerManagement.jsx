import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Phone, User, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const fetchCustomers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Gagal mengambil data:', error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('customers')
        .insert([{
            name: formData.name,
            phone: formData.phone,
            address: formData.address
        }]);

      if (error) throw error;

      setIsModalOpen(false);
      setFormData({ name: '', address: '', phone: '' });
      fetchCustomers();
      
      Swal.fire('Berhasil', 'Pelanggan baru terdaftar.', 'success');
    } catch (error) {
      console.error('Error:', error.message);
      Swal.fire('Gagal', error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><User size={28}/> Manajemen Pelanggan</h2>
          <p className="text-gray-500 text-sm">Data pelanggan untuk transaksi.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition">
          <Plus size={18} /> Daftar Baru
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Memuat data...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">Belum ada data pelanggan.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="font-bold text-lg text-gray-800">{customer.name}</h3>
                     <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone size={14}/> {customer.phone}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                      <User size={20}/>
                  </div>
               </div>
               <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><MapPin size={12}/> {customer.address}</p>
                  <button 
                    onClick={() => navigate(`/customers/${customer.id}/products`)}
                    className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition border border-blue-100"
                  >
                    Lihat Produk
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Tambah Pelanggan</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="text" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Lengkap" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="tel" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="No. Telepon" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <textarea className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Alamat Lengkap" rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">Simpan Data</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;