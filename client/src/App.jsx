import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';

// Import halaman Admin baru (perhatikan path-nya)
import UserManagement from './pages/admin/UserManagement'; 
import CustomerManagement from './pages/kasir/CustomerManagement';
import CustomerProducts from './pages/kasir/CustomerProducts';
import PackagingTypeManagement from './pages/admin/PackagingTypeManagement';
import CreateTransaction from './pages/kasir/CreateTransaction';
import InvoicePage from './pages/kasir/InvoicePage';
import SelectCustomerForOrder from './pages/kasir/SelectCustomerForOrder';
import DesignerDashboard from './pages/designer/DesignerDashboard';
import ProductionDashboard from './pages/operator/ProductionDashboard';
import InventoryPage from './pages/operator/InventoryPage';
import OrderHistory from './pages/OrderHistory';
import InventoryHistory from './pages/operator/InventoryHistory';
import FinanceDashboard from './pages/kasir/FinanceDashboard';
import FinanceHistory from './pages/kasir/FinanceHistory';
import PaymentPage from './pages/kasir/PaymentPage';
import ManagerDashboard from './pages/manajer/ManagerDashboard';
import ManagerReports from './pages/manajer/ManagerReports';
import ProductionReport from './pages/manajer/ProductionReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          
         {/* Admin Routes */}
          <Route path="users" element={<UserManagement />} />
          <Route path="packaging-types" element={<PackagingTypeManagement />} />

          {/* Kasir Routes */}
          <Route path="customers" element={<CustomerManagement />} />
          {/* --- ROUTE BARU DENGAN PARAMETER ID --- */}
          <Route path="customers/:customerId/products" element={<CustomerProducts />} />
          <Route path="transactions/new/:customerId" element={<CreateTransaction />} />
          <Route path="transactions/create" element={<SelectCustomerForOrder />} />
          <Route path="transactions/new/:customerId" element={<CreateTransaction />} />
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="finance/history" element={<FinanceHistory />} />
          <Route path="payments" element={<PaymentPage />} />

          {/* Route Desainer */}
          <Route path="designer" element={<DesignerDashboard />} />

          {/* Route Operator */}
          <Route path="production" element={<ProductionDashboard />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/history" element={<InventoryHistory />} />

          {/* Route Riwayat */}
          <Route path="history" element={<OrderHistory />} />

          {/* Route Manajer */}
          <Route path="manager-dashboard" element={<ManagerDashboard />} />
          <Route path="reports" element={<ManagerReports />} />
          <Route path="reports/production" element={<ProductionReport />} />
        </Route>

        <Route path="/invoice/:transactionId" element={<InvoicePage />} />

      </Routes>
    </Router>
  );
}

export default App;