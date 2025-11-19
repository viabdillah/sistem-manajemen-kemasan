import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

const UserManagement = () => {
  // --- STATES ---
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  
  const [formData, setFormData] = useState({
    id: '',
    namaLengkap: '',
    username: '',
    password: '',
    role: 'operator'
  });

  // --- FETCH DATA (READ) ---
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/users');
      const data = await response.json();
      setUsers(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Gagal ambil data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HANDLERS ---
  
  const handleAdd = () => {
    setModalMode('add');
    setFormData({ id: '', namaLengkap: '', username: '', password: '', role: 'operator' });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setFormData({
      id: user._id,
      namaLengkap: user.namaLengkap,
      username: user.username,
      password: '', 
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin Hapus User?',
      text: "Tindakan ini tidak bisa dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', 
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { method: 'DELETE' });
        fetchUsers(); 
        
        Swal.fire(
          'Terhapus!',
          'Data user telah berhasil dihapus.',
          'success'
        );
      } catch (error) {
        console.error("Error deleting user:", error); 
        Swal.fire(
          'Gagal!',
          'Terjadi kesalahan saat menghapus data.',
          'error'
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (modalMode === 'add' && !formData.password) {
        Swal.fire('Error', 'Password wajib diisi saat membuat user baru!', 'warning');
        return;
    }

    const url = modalMode === 'add' 
      ? '${import.meta.env.VITE_API_URL}/api/users' 
      : `${import.meta.env.VITE_API_URL}/api/users/${formData.id}`;
    
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        fetchUsers(); 
        
        Swal.fire({
            icon: 'success', 
            title: 'Berhasil!', 
            text: modalMode === 'add' ? 'User berhasil ditambah!' : 'Data user berhasil diupdate!',
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
      console.error('Error:', error);
      Swal.fire({
        icon: 'error', 
        title: 'Kesalahan Server', 
        text: 'Tidak dapat terhubung ke server API.',
      });
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      kasir: 'bg-green-100 text-green-700',
      manajer: 'bg-blue-100 text-blue-700',
      operator: 'bg-orange-100 text-orange-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Halaman (Tetap) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen User</h2>
          <p className="text-gray-500 text-sm">Kelola akun karyawan dan hak akses.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Memuat data...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada data user.</div>
      ) : (
        <>
          {/* --- 1. TABEL DESKTOP (Hanya Tampil di Layar Besar) --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Lengkap</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{user.namaLengkap}</td>
                    <td className="px-6 py-4 text-gray-600">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700" title="Edit">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700" title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- 2. CARD/LIST VIEW MOBILE (Hanya Tampil di Layar Kecil) --- */}
          <div className="md:hidden space-y-3">
            {users.map((user) => (
              <div key={user._id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                
                {/* Header (Nama & Role) */}
                <div className="flex justify-between items-start border-b pb-2 mb-2">
                  <p className="text-lg font-bold text-gray-800">{user.namaLengkap}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>

                {/* Detail (Username) */}
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-500">Username:</span>
                  <span className="font-medium text-gray-700">{user.username}</span>
                </div>

                {/* Aksi */}
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <span className="font-medium text-gray-700">Aksi:</span>
                  <div className="flex gap-4">
                    <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium" title="Edit">
                        <Pencil size={16} /> Edit
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium" title="Hapus">
                        <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL FORM (Tetap sama) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                {modalMode === 'add' ? 'Tambah User Baru' : 'Edit Data User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({...formData, namaLengkap: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  disabled={modalMode === 'edit'}
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modalMode === 'add' ? 'Password' : 'Password Baru (Opsional)'}
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required={modalMode === 'add'} 
                  placeholder={modalMode === 'edit' ? 'Biarkan kosong jika tidak diganti' : ''}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Jabatan</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="operator">Operator</option>
                  <option value="kasir">Kasir</option>
                  <option value="manajer">Manajer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30"
                >
                  Simpan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;