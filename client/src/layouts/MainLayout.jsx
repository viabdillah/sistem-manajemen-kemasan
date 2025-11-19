import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu, 
  X, 
  ShoppingBag,
  Palette
} from 'lucide-react';
import Swal from 'sweetalert2';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // --- DETEKSI ROLE DESAINER ---
  // Ubah 'operator' jika di database Anda menggunakan nama role 'desainer'
  const isDesigner = user?.role === 'operator'; 

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: "Akhiri sesi kerja?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      background: '#fff',
      customClass: { popup: 'rounded-xl' }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    });
  };

  const menus = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['admin', 'kasir', 'operator', 'manajer'] },
    { name: 'Buat Pesanan', path: '/transactions/create', icon: <ShoppingBag size={20} />, roles: ['admin', 'kasir'] },
    { name: 'Data Pelanggan', path: '/customers', icon: <Users size={20} />, roles: ['admin', 'kasir'] },
    { name: 'Tugas Desainer', path: '/designer', icon: <Palette size={20} />, roles: ['admin', 'operator', 'manajer'] },
    { name: 'Manajemen User', path: '/users', icon: <Users size={20} />, roles: ['admin'] },
    { name: 'Manajemen Kemasan', path: '/packaging-types', icon: <Package size={20} />, roles: ['admin', 'manajer'] },
    { name: 'Produksi & Stok', path: '/inventory', icon: <Package size={20} />, roles: ['admin', 'operator', 'manajer'] },
  ];

  if (!user) return null;

  // --- KHUSUS TAMPILAN DESAINER (FULL SCREEN) ---
  if (isDesigner) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        {/* Render Konten Langsung Tanpa Sidebar/Header */}
        <main className="h-full w-full">
          <Outlet />
        </main>

        {/* Tombol Logout Melayang Khusus Desainer (Pojok Kanan Atas) */}
        <button 
          onClick={handleLogout}
          className="fixed top-6 right-6 z-50 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg border border-white/30 group"
          title="Logout"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform"/>
        </button>
      </div>
    );
  }

  // --- TAMPILAN STANDAR (ADMIN/KASIR/MANAJER) ---
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`
        bg-slate-900 text-white flex flex-col h-full shadow-xl z-50
        transition-transform duration-300 ease-in-out
        fixed inset-y-0 left-0 w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-64 lg:flex
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950 shrink-0">
            <h1 className="text-xl font-bold text-blue-500 tracking-wider">KEMASAN<span className="text-white">SYS</span></h1>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white lg:hidden p-1">
                <X size={24} />
            </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menus.map((menu, index) => {
            if (menu.roles.includes(user.role)) {
              return (
                <div 
                  key={index}
                  onClick={() => {
                    navigate(menu.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group select-none
                    ${location.pathname === menu.path 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <span className={`shrink-0 transition-transform duration-300 ${location.pathname === menu.path ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {menu.icon}
                  </span>
                  <span className="ml-3 font-medium tracking-wide text-sm">{menu.name}</span>
                </div>
              );
            }
            return null;
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition duration-200 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="ml-3 font-medium text-sm">Keluar</span>
          </button>
        </div>
      </aside>
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}/>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative"> 
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 shrink-0 border-b border-gray-200 z-30">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold text-gray-800 lg:hidden">
               {menus.find(m => m.path === location.pathname)?.name || 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-bold text-gray-800">{user.namaLengkap}</p>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">{user.role}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white ring-2 ring-blue-100 cursor-default select-none">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 scroll-smooth">
          <Outlet /> 
        </main>
      
        <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 transition-transform duration-300 hover:scale-110 active:scale-95 lg:hidden"
        >
            <Menu size={24} />
        </button>
      </div>
    </div>
  );
};

export default MainLayout;