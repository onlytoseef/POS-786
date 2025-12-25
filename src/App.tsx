import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Imports from './pages/Imports';
import Sales from './pages/Sales';
import Payments from './pages/Payments';
import CashPayment from './pages/CashPayment';
import CreditVoucher from './pages/CreditVoucher';
import CashReceived from './pages/CashReceived';
import GeneralLedger from './pages/GeneralLedger';
import CustomerLedgerDetails from './pages/CustomerLedgerDetails';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#242A2A',
            color: '#EBE0C0',
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '14px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: '2px solid #EBE0C0',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
            duration: 5000,
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="imports" element={<Imports />} />
              <Route path="sales" element={<Sales />} />
              <Route path="payments" element={<Payments />} />
              <Route path="payments/cash" element={<CashPayment />} />
              <Route path="payments/credit-voucher" element={<CreditVoucher />} />
              <Route path="payments/cash-received" element={<CashReceived />} />
              <Route path="ledger" element={<GeneralLedger />} />
              <Route path="ledger/customer/:id" element={<CustomerLedgerDetails />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
