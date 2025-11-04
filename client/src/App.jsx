// client/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Impor Komponen Inti ---
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/layout/MainLayout.jsx';

// --- Impor Halaman Publik ---
import LoginPage from './pages/LoginPage.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import HalamanNotFound from './pages/HalamanNotFound.jsx'; // (Asumsi Anda punya file ini)

// --- Impor Halaman Admin ---
import ManageUsersPage from './pages/admin/ManageUsersPage.jsx';

// --- Impor Halaman Kasir ---
import CashierDashboardPage from './pages/cashier/CashierDashboardPage.jsx';
import AddCustomerPage from './pages/cashier/AddCustomerPage.jsx';
import AddOrderPage from './pages/cashier/AddOrderPage.jsx';
import OrderListPage from './pages/cashier/OrderListPage.jsx';
import InvoicePage from './pages/cashier/InvoicePage.jsx';

// --- Impor Halaman Desainer ---
import DesignerQueuePage from './pages/designer/DesignerQueuePage.jsx';
import DesignerHistoryPage from './pages/designer/DesignerHistoryPage.jsx';

// --- Impor Halaman Operator ---
import OperatorQueuePage from './pages/operator/OperatorQueuePage.jsx';

// --- Impor Halaman Inventaris ---
import StockOpnamePage from './pages/inventory/StockOpnamePage.jsx';
import MaterialHistoryPage from './pages/inventory/MaterialHistoryPage.jsx';

// --- Impor Halaman Keuangan ---
import FinancialHistoryPage from './pages/financials/FinancialHistoryPage.jsx';

// --- Impor Halaman Manajer ---
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage.jsx';
import ProductionReportPage from './pages/manager/ProductionReportPage.jsx';

// Placeholder (jika Anda belum memindahkannya)
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';


function App() {
  return (
    <Routes>
      {/* ====================================================== */}
      {/* Rute Publik (Login & Halaman Error) */}
      {/* ====================================================== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ====================================================== */}
      {/* Rute Admin Sistem (Hanya Admin) */}
      {/* ====================================================== */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['admin_sistem']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
      </Route>
      
      {/* ====================================================== */}
      {/* Rute Kasir (Kasir & Admin) */}
      {/* ====================================================== */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['kasir', 'admin_sistem']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/kasir" element={<CashierDashboardPage />} />
        <Route path="/kasir/pelanggan/tambah" element={<AddCustomerPage />} />
        <Route path="/kasir/pesanan" element={<OrderListPage />} />
        <Route path="/kasir/pesanan/tambah" element={<AddOrderPage />} />
      </Route>

      {/* ====================================================== */}
      {/* Rute Desainer (Desainer & Admin) */}
      {/* ====================================================== */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['desainer', 'admin_sistem']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/desainer/antrian" element={<DesignerQueuePage />} />
        <Route path="/desainer/riwayat" element={<DesignerHistoryPage />} />
      </Route>

      {/* ====================================================== */}
      {/* Rute Operator (Operator & Admin) */}
      {/* ====================================================== */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['operator', 'admin_sistem']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/operator/antrian" element={<OperatorQueuePage />} />
      </Route>

      {/* ====================================================== */}
      {/* Rute Manajer (Manajer & Admin) */}
      {/* ====================================================== */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['manajer', 'admin_sistem']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/manajer/dashboard" element={<ManagerDashboardPage />} />
        <Route path="/manajer/laporan-produksi" element={<ProductionReportPage />} />
      </Route>

      {/* ====================================================== */}
      {/* Rute Lintas Role (Keuangan, Inventaris, Invoice) */}
      {/* ====================================================== */}
      
      {/* Rute Keuangan & Invoice (Admin, Kasir, Manajer) */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['admin_sistem', 'kasir', 'manajer']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/keuangan" element={<FinancialHistoryPage />} />
        <Route path="/kasir/pesanan/:orderId/invoice" element={<InvoicePage />} />
      </Route>
      
      {/* Rute Inventaris (Admin, Operator, Manajer) */}
      <Route 
        element={
          <ProtectedRoute allowedRoles={['admin_sistem', 'operator', 'manajer']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/inventory/stok" element={<StockOpnamePage />} />
        <Route path="/inventory/riwayat" element={<MaterialHistoryPage />} />
      </Route>

      {/* ====================================================== */}
      {/* Rute Halaman Tidak Ditemukan (WAJIB PALING AKHIR) */}
      {/* ====================================================== */}
      <Route path="*" element={<HalamanNotFound />} />
    </Routes>
  );
}

export default App;