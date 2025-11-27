import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PatientDashboard from '@/pages/patient/PatientDashboard';
import PatientMedicalRecordsPage from '@/pages/patient/PatientMedicalRecordsPage';
import PatientQRCodePage from '@/pages/patient/QRCodePage';
import PatientPaymentsPage from '@/pages/patient/PaymentsPage';
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import DoctorPatientsPage from '@/pages/doctor/DoctorPatientsPage';
import DoctorPatientDetailPage from '@/pages/doctor/DoctorPatientDetailPage';
import DoctorNewRecordPage from '@/pages/doctor/DoctorNewRecordPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminActivityPage from '@/pages/admin/AdminActivityPage';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';
import { ROLES } from '@/lib/constants';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route
          path="patient"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PACIENTE]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="patient/medical-records"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PACIENTE]}>
              <PatientMedicalRecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="patient/qr-code"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PACIENTE]}>
              <PatientQRCodePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="patient/payments"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PACIENTE]}>
              <PatientPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctor"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctor/patients"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
              <DoctorPatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctor/patients/:patientId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
              <DoctorPatientDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctor/patients/:patientId/new-record"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
              <DoctorNewRecordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/activity"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
              <AdminActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/payments"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
              <AdminPaymentsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      
      <Route path="/unauthorized" element={<div className="p-8 text-center">No autorizado</div>} />
      <Route path="*" element={<div className="p-8 text-center">Página no encontrada</div>} />
    </Routes>
  );
}

function DashboardRedirect() {
  const { user } = useAuthStore();

  if (user?.role === ROLES.PACIENTE) {
    return <Navigate to="/dashboard/patient" replace />;
  }

  if (user?.role === ROLES.ADMINISTRADOR) {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <Navigate to="/dashboard/doctor" replace />;
}
