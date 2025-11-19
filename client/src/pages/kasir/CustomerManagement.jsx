import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Phone, User, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Gagal mengambil data pelanggan:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', address: '', phone: '' }); 
        fetchCustomers(); 
        
        Swal.fire({
            icon: 'success', 
            title: 'Berhasil!', 
            text: 'Pelanggan baru berhasil didaftarkan.',
            timer: 2000,
            showConfirmButton: false,
        });
      } else {
        Swal.fire({
            icon: 'error', 
            title: 'Gagal!', 
            text: data.message,
            confirmButtonText: 'OK'
        });
      }

    } catch (error) {
      console.error('Error mendaftarkan pelanggan:', error);
      Swal.fire({
        icon: 'error', 
        title: 'Kesalahan Server', 
        text: 'Tidak dapat terhubung ke server API.',
      });
    }
  };


  return (
    <div className="space-y-6">
      
      {/* Header & Tombol Tambah (Tetap) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Pelanggan</h2>
          <p className="text-gray-500 text-sm">Pendaftaran dan daftar pelanggan untuk transaksi.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> Daftar Pelanggan Baru
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Memuat data...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada data pelanggan.</div>
      ) : (
        <>
          {/* --- 1. TABEL DESKTOP (Hidden di Mobile) --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Telepon</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Alamat</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{customer.name}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.address.substring(0, 50)}...</td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                        {/* Aksi: Tombol View */}
                        <button 
                            onClick={() => navigate(`/customers/${customer._id}/products`)} 
                            className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                            Lihat Produk
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- 2. SNACKBAR CARD VIEW MOBILE (Hidden di Desktop) --- */}
          <div className="md:hidden space-y-2">
            {customers.map((customer) => (
              <div key={customer._id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100 transition duration-150 hover:shadow-md">
                
                {/* KIRI: Nama & Telepon (Stack Vertikal) */}
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-semibold text-gray-800 truncate flex items-center gap-2">
                    <User size={16}/> {customer.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate pt-0.5 flex items-center gap-1">
                    <Phone size={12}/> {customer.phone}
                  </p>
                </div>

                {/* KANAN: Alamat & Aksi */}
                <div className="flex items-center space-x-3 ml-4">
                    <span className="text-xs text-gray-600 hidden sm:inline truncate max-w-[100px]">
                        <MapPin size={12} className="inline mr-1"/> {customer.address.substring(0, 20)}...
                    </span>
                    
                    {/* Tombol Lihat Detail */}
                    <button 
                    onClick={() => navigate(`/customers/${customer._id}/products`)}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium whitespace-nowrap"
                    >
                        Lihat Detail
                    </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL PENDAFTARAN (Tetap sama) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            
            <div className="bg-green-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-green-700 flex items-center gap-2">
                <User size={20} /> Daftarkan Pelanggan Baru
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-500"/>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nama Pelanggan (Wajib)"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-gray-500"/>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nomor Telepon (Wajib, harus unik)"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-gray-500 mt-2"/>
                <textarea 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Alamat Lengkap (Wajib)"
                  rows="3"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg"
                >
                  Daftarkan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerManagement;