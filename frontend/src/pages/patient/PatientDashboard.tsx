import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, QrCode, DollarSign, Bell, Clock } from 'lucide-react';
import { medicalRecordsAPI, paymentsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state: any) => state.user);

  // Obtener estadísticas
  const { data: medicalRecordsData } = useQuery({
    queryKey: ['patient-medical-records'],
    queryFn: () => medicalRecordsAPI.getByPatient(user?.patient?.id || ''),
    enabled: !!user?.patient?.id,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['patient-payments'],
    queryFn: () => paymentsAPI.getByPatient(user?.patient?.id || ''),
    enabled: !!user?.patient?.id,
  });

  const medicalRecords = medicalRecordsData?.data || [];
  const payments = paymentsData?.data || [];

  const totalRecords = medicalRecords?.length || 0;
  const pendingPayments = payments?.filter((p: any) => p.estado === 'PENDIENTE')?.length || 0;
  const totalPaid = payments?.filter((p: any) => p.estado === 'PAGADO')?.reduce((sum: number, p: any) => sum + p.monto, 0) || 0;

  const cards = [
    {
      title: 'Mi Historia Clínica',
      description: 'Ver mi información médica',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      route: '/dashboard/patient/medical-records',
      stats: `${totalRecords} ${totalRecords === 1 ? 'registro' : 'registros'}`,
    },
    {
      title: 'Código QR',
      description: 'Generar y descargar mi QR',
      icon: QrCode,
      color: 'from-purple-500 to-purple-600',
      route: '/dashboard/patient/qr-code',
      stats: 'Acceso rápido',
    },
    {
      title: 'Mis Pagos',
      description: 'Gestionar mis pagos',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      route: '/dashboard/patient/payments',
      stats: pendingPayments > 0 ? `${pendingPayments} pendientes` : 'Al día',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido, {user?.patient?.nombre}
        </h1>
        <p className="text-gray-600">Gestiona tu información médica de forma segura</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Historias Clínicas</span>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Pagos Pendientes</span>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingPayments}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Pagado</span>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Notificaciones</span>
            <Bell className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* Tarjetas de navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.route)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all hover:scale-105"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{card.description}</p>
            <p className="text-sm font-medium text-blue-600">{card.stats}</p>
          </div>
        ))}
      </div>

      {/* Alerta de pagos pendientes */}
      {pendingPayments > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800">
                Tienes {pendingPayments} {pendingPayments === 1 ? 'pago pendiente' : 'pagos pendientes'}
              </h4>
              <p className="text-sm text-yellow-700">
                Para mantener tu cuenta activa, por favor realiza los pagos pendientes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
