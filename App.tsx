import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { BusinessInquiry } from './pages/BusinessInquiry';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { BusinessDashboard } from './pages/BusinessDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { PaymentPortal } from './pages/PaymentPortal';
import { RedirectBridge } from './pages/RedirectBridge';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SessionMonitor } from './components/SessionMonitor';
import ScrollToTop from './components/ScrollToTop';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <SessionMonitor />
          {/* Global container with grid background and scanline overlay */}
          <div className="min-h-screen bg-cyber-black text-gray-200 font-sans relative selection:bg-neon-pink selection:text-white overflow-x-hidden">
            <div className="fixed inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-20 pointer-events-none z-0"></div>
            <div className="scanlines fixed inset-0 pointer-events-none z-50 opacity-30"></div>
            
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/go" element={<RedirectBridge />} />
                  <Route path="/terms" element={<Terms />} />

                  {/* Protected: Business Only */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.BUSINESS]} />}>
                    <Route path="/business" element={<BusinessInquiry />} />
                    <Route path="/business-dashboard" element={<BusinessDashboard />} />
                  </Route>

                  {/* Protected: Creators Only */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.CREATOR]} />}>
                    <Route path="/creators" element={<CreatorDashboard />} />
                  </Route>

                  {/* Protected: Admin Only */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  </Route>

                  {/* Protected: Any Authenticated User */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/payment/:saleId" element={<PaymentPortal />} />
                  </Route>

                  {/* Catch All */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <footer className="border-t border-cyber-gray bg-cyber-dark py-8 mt-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm font-mono flex flex-col gap-2">
                  <p className="uppercase tracking-widest">&copy; 2024 SOCIAL SWARM // NETWORK SECURE</p>
                  <Link to="/terms" className="text-xs text-neon-blue hover:text-white hover:underline">Master Protocol Agreement (Terms)</Link>
                </div>
              </footer>
            </div>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;