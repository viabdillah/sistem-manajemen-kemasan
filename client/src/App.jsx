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

          {/* Route Desainer */}
          <Route path="designer" element={<DesignerDashboard />} />
        </Route>

        <Route path="/invoice/:transactionId" element={<InvoicePage />} />

      </Routes>
    </Router>
  );
}

export default App;