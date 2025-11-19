import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ArrowRight, PlusCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient'; // Import Supabase

const SelectCustomerForOrder = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter pencarian
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Header dengan Search Bar Glassmorphism */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-2">Buat Pesanan Baru</h2>
        <p className="text-blue-100 text-sm opacity-90">Pilih pelanggan untuk memulai transaksi.</p>
        
        <div className="mt-8 relative group max-w-2xl">
            <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 group-focus-within:text-white transition-colors duration-300" 
                size={22} 
            />
            <input 
                type="text" 
                placeholder="Cari nama atau nomor telepon pelanggan..." 
                className="w-full pl-14 pr-6 py-4 rounded-xl
                           bg-white/10 border border-white/20 backdrop-blur-md
                           text-white placeholder-blue-200/70 font-medium
                           focus:outline-none focus:bg-white/20 focus:border-white/50 
                           focus:ring-4 focus:ring-white/10
                           transition-all duration-300 shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Daftar Pelanggan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div 
            onClick={() => navigate('/customers')}
            className="border-2 border-dashed border-blue-300 rounded-xl p-6 flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-50 transition h-40"
        >
            <PlusCircle size={32} className="mb-2" />
            <span className="font-semibold">Pelanggan Baru?</span>
            <span className="text-xs text-center mt-1">Daftarkan di sini dulu</span>
        </div>

        {isLoading ? (
             <div className="col-span-full text-center py-10 text-gray-500">Memuat data...</div>
        ) : filteredCustomers.length === 0 ? (
             <div className="col-span-full text-center py-10 text-gray-400">Pelanggan tidak ditemukan.</div>
        ) : (
            filteredCustomers.map(customer => (
                <div 
                    key={customer.id} // Ganti _id jadi id
                    onClick={() => navigate(`/transactions/new/${customer.id}`)}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition group relative overflow-hidden"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">{customer.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                {customer.phone}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 line-clamp-1">{customer.address}</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                            <User size={20} />
                        </div>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={18} className="text-blue-500"/>
                    </div>
                </div>
            ))
        )}

      </div>
    </div>
  );
};

export default SelectCustomerForOrder;