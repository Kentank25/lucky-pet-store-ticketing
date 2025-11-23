import { useRole } from './context/RoleContext';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AdminDashboard from './features/admin/AdminDashboard';
import KioskDashboard from './features/kiosk/KioskDashboard';
import PicDashboard from './features/pic/PicDashboard';

function App() {
  const { role } = useRole();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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
