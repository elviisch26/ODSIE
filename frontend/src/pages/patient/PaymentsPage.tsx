import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Calendar, Clock, Check, X, Search } from 'lucide-react';
import { paymentsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getMonthName = (month: number): string => {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return months[month - 1] || '';
};

export default function PatientPaymentsPage() {
  const user = useAuthStore((state: any) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['patient-payments', user?.patient?.id],
    queryFn: () => paymentsAPI.getByPatient(user?.patient?.id || ''),
    enabled: !!user?.patient?.id,
  });

  const payments = paymentsData?.data || [];

  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch =
      getMonthName(payment.mes).toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.anio.toString().includes(searchTerm);
    const matchesFilter = filterStatus === 'TODOS' || payment.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPaid = payments
    .filter((p: any) => p.estado === 'PAGADO')
    .reduce((sum: number, p: any) => sum + p.monto, 0);

  const totalPending = payments
    .filter((p: any) => p.estado === 'PENDIENTE')
    .reduce((sum: number, p: any) => sum + p.monto, 0);

  const pendingCount = payments.filter((p: any) => p.estado === 'PENDIENTE').length;
  const paidCount = payments.filter((p: any) => p.estado === 'PAGADO').length;

  const getStatusBadge = (estado: string) => {
    const badges = {
      PAGADO: 'bg-green-100 text-green-800 border-green-200',
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ATRASADO: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[estado as keyof typeof badges] || badges.PENDIENTE;
  };

  const getStatusIcon = (estado: string) => {
    if (estado === 'PAGADO') return <Check className="h-4 w-4" />;
    if (estado === 'ATRASADO') return <X className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pagos</h1>
        <p className="text-gray-600">Gestiona tus pagos de suscripción mensual</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Pagado</span>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Pendiente</span>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalPending.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Pagos Realizados</span>
            <Check className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{paidCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Pagos Pendientes</span>
            <X className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>
      </div>

      {/* Alertas */}
      {pendingCount > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                Tienes {pendingCount} {pendingCount === 1 ? 'pago pendiente' : 'pagos pendientes'}
              </h4>
              <p className="text-sm text-yellow-700">
                Para mantener tu cuenta activa, por favor contacta con el administrador para
                gestionar tus pagos pendientes. Total pendiente: ${totalPending.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por mes o año..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PAGADO">Pagados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="ATRASADO">Atrasados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de pagos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>No se encontraron pagos</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getMonthName(payment.mes)} {payment.anio}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${payment.monto.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                          payment.estado
                        )}`}
                      >
                        {getStatusIcon(payment.estado)}
                        <span>{payment.estado}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.fecha_pago
                        ? format(new Date(payment.fecha_pago), 'dd MMM yyyy', { locale: es })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.metodo_pago || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Información de Pagos</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              La suscripción mensual debe pagarse antes del día 5 de cada mes para evitar
              suspensiones
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Si tu cuenta está bloqueada por falta de pago, contacta al administrador para
              regularizar tu situación
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>
              Una vez realizado el pago, el administrador lo marcará como pagado en el sistema
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Puedes consultar tu historial completo de pagos en cualquier momento</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
