import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../../services/supabaseClient';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  
  const [formData, setFormData] = useState({
    id: '',
    namaLengkap: '',
    username: '',
    password: '',
    role: ''
  });

  // 1. FETCH DATA
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(user => ({
        id: user.id,
        namaLengkap: user.full_name,
        username: user.username,
        role: user.role
      }));

      setUsers(formattedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Gagal ambil data:', error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // HANDLERS
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ id: '', namaLengkap: '', username: '', password: '', role: 'operator' });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setFormData({
      id: user.id,
      namaLengkap: user.namaLengkap,
      username: user.username,
      password: '', 
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus User?',
      text: "User akan dihapus dari daftar.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        fetchUsers(); 
        Swal.fire('Terhapus!', 'User berhasil dihapus.', 'success');
      } catch (error) {
        console.error("Error:", error); 
        Swal.fire('Gagal!', error.message, 'error');
      }
    }
  };

  // 2. SUBMIT FORM (CREATE PAKAI EDGE FUNCTION)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (modalMode === 'add' && !formData.password) {
        Swal.fire('Error', 'Password wajib diisi!', 'warning');
        return;
    }

    try {
      if (modalMode === 'add') {
        // --- PANGGIL EDGE FUNCTION 'create-user' ---
        const { data, error: funcError } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.username + '@kemasan.sys', // Buat email dummy
            password: formData.password,
            namaLengkap: formData.namaLengkap,
            username: formData.username,
            role: formData.role
          }
        });

        if (funcError) throw new Error(funcError.message || 'Gagal memanggil server.');
        if (data && data.error) throw new Error(data.error);

        Swal.fire('Berhasil!', 'User baru berhasil dibuat & siap login.', 'success');
        
      } else {
        // --- UPDATE USER (Cukup update tabel profiles) ---
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formData.namaLengkap,
                role: formData.role
            })
            .eq('id', formData.id);

        if (error) throw error;
        Swal.fire('Berhasil!', 'Data user berhasil diupdate.', 'success');
      }

      setIsModalOpen(false);
      fetchUsers(); 

    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('Admin Sistem tidak boleh dihapus')) {
         Swal.fire('Akses Ditolak', 'Admin Utama tidak bisa diubah sembarangan.', 'error');
      } else {
         Swal.fire('Gagal', error.message, 'error');
      }
    }
  };

  // Helper badge role
  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      kasir: 'bg-green-100 text-green-700',
      manajer: 'bg-blue-100 text-blue-700',
      operator: 'bg-orange-100 text-orange-700',
      desainer: 'bg-pink-100 text-pink-700 border-pink-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen User</h2>
          <p className="text-gray-500 text-sm">Kelola akun karyawan dan hak akses.</p>
        </div>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition">
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {/* Tabel User */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* --- PERBAIKAN DI SINI: Gunakan isLoading --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
             <p>Sedang memuat data user...</p>
          </div>
        ) : (
          <>
            {/* Tampilan Desktop */}
            <table className="w-full text-left hidden md:table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Lengkap</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-8 text-gray-500">Belum ada data user.</td></tr>
                ) : (
                    users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">{user.namaLengkap}</td>
                        <td className="px-6 py-4 text-gray-600">{user.username}</td>
                        <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>{user.role}</span>
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-3">
                        <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
            
            {/* Tampilan Mobile */}
            <div className="md:hidden space-y-3 p-4">
                {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Belum ada data user.</div>
                ) : (
                    users.map((user) => (
                    <div key={user.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-start border-b pb-2 mb-2">
                        <p className="text-lg font-bold text-gray-800">{user.namaLengkap}</p>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>{user.role}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-500">User:</span>
                        <span className="font-medium text-gray-700">{user.username}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t mt-3">
                        <span className="font-medium text-gray-700">Aksi:</span>
                        <div className="flex gap-4">
                            <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"><Pencil size={16} /> Edit</button>
                            <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"><Trash2 size={16} /> Hapus</button>
                        </div>
                        </div>
                    </div>
                    ))
                )}
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">{modalMode === 'add' ? 'Tambah User Baru' : 'Edit Data User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="text" className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Lengkap" required value={formData.namaLengkap} onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})} />
              <input type="text" className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username" required disabled={modalMode === 'edit'} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              <input type="password" className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder={modalMode === 'add' ? 'Password' : 'Password Baru (Opsional)'} required={modalMode === 'add'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Jabatan</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  {/* Opsi default agar user wajib memilih */}
                  <option value="" disabled>-- Pilih Role --</option>
                  
                  <option value="desainer">Desainer (Creative)</option>
                  <option value="operator">Operator (Produksi)</option>
                  <option value="kasir">Kasir</option>
                  <option value="manajer">Manajer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;