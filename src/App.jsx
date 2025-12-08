import { useRole } from './context/RoleContext';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AdminDashboard from './features/admin/AdminDashboard';
import KioskDashboard from './features/kiosk/KioskDashboard';
import PicDashboard from './features/pic/PicDashboard';

import LoginPage from './pages/LoginPage';

function App() {
  const { role } = useRole();
  const { loading } = useAuth(); // Keep auth loading for firebase init

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!role) {
    return <LoginPage />;
  }

  return (
    <Layout>
      {role === 'admin' && <AdminDashboard />}
      {role === 'kiosk' && <KioskDashboard />}
      {(role === 'pic_grooming' || role === 'pic_klinik') && <PicDashboard />}
    </Layout>
  );
}

export default App;
