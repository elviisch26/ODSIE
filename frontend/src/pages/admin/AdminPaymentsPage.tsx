import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { DollarSign, Search, Check, X, Calendar } from 'lucide-react';

interface Payment {
  id: string;
  patient_id: string;
  mes: number;
  anio: number;
  monto: string;
  fecha_pago: string | null;
  status: string;
  metodo_pago: string | null;
  referencia: string | null;
  patient?: {
    user: {
      nombres: string;
      apellidos: string;
      email: string;
      cedula: string;
    };
  };
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentData, setPaymentData] = useState({
    metodo_pago: '',
    referencia: '',
  });

  // Obtener todos los pagos
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments-all'],
    queryFn: async () => {
      const { data } = await paymentsAPI.getAll();
      return data;
    },
  });

  // Obtener estadísticas
  const { data: stats } = useQuery({
    queryKey: ['payments-stats'],
    queryFn: async () => {
      const { data } = await paymentsAPI.getStatistics();
      return data;
    },
  });

  // Mutation para marcar como pagado
  const markAsPaidMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await paymentsAPI.markAsPaid(id, data);
    },
    onSuccess: () => {
      toast.success('Pago registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['payments-all'] });
      queryClient.invalidateQueries({ queryKey: ['payments-stats'] });
      setSelectedPayment(null);
      setPaymentData({ metodo_pago: '', referencia: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar pago');
    },
  });

  // Filtrar pagos
  const filteredPayments = payments.filter((payment: Payment) => {
    const matchesSearch =
      payment.patient?.user.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.patient?.user.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.patient?.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.patient?.user.cedula?.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleMarkAsPaid = () => {
    if (!selectedPayment) return;
    if (!paymentData.metodo_pago) {
      toast.error('Selecciona un método de pago');
      return;
    }
    markAsPaidMutation.mutate({ id: selectedPayment.id, data: paymentData });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
        <p className="text-gray-600 mt-2">Administrar pagos y suscripciones mensuales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Total Pagado</h3>
              <p className="text-2xl font-bold">${stats?.total_pagado || 0}</p>
            </div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Total Pendiente</h3>
              <p className="text-2xl font-bold">${stats?.total_pendiente || 0}</p>
            </div>
            <X className="w-8 h-8 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Pagos Realizados</h3>
              <p className="text-2xl font-bold">{stats?.pagos_realizados || 0}</p>
            </div>
            <Check className="w-8 h-8 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Pagos Pendientes</h3>
              <p className="text-2xl font-bold">{stats?.pagos_pendientes || 0}</p>
            </div>
            <Calendar className="w-8 h-8 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="PAGADO">Pagados</option>
            <option value="ATRASADO">Atrasados</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando pagos...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No se encontraron pagos</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
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
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment: Payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {payment.patient?.user.nombres} {payment.patient?.user.apellidos}
                        </div>
                        <div className="text-gray-500">{payment.patient?.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMonthName(payment.mes)} {payment.anio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${payment.monto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'PAGADO'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'ATRASADO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.metodo_pago || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status !== 'PAGADO' && (
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Marcar como Pagado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Registrar Pago
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Paciente:</p>
              <p className="font-semibold">
                {selectedPayment.patient?.user.nombres} {selectedPayment.patient?.user.apellidos}
              </p>
              <p className="text-sm text-gray-600 mt-2">Período:</p>
              <p className="font-semibold">
                {getMonthName(selectedPayment.mes)} {selectedPayment.anio}
              </p>
              <p className="text-sm text-gray-600 mt-2">Monto:</p>
              <p className="font-semibold text-green-600">${selectedPayment.monto}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={paymentData.metodo_pago}
                  onChange={(e) => setPaymentData({ ...paymentData, metodo_pago: e.target.value })}
                  className="input"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Transferencia bancaria">Transferencia bancaria</option>
                  <option value="Depósito">Depósito</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referencia / Comprobante
                </label>
                <input
                  type="text"
                  value={paymentData.referencia}
                  onChange={(e) => setPaymentData({ ...paymentData, referencia: e.target.value })}
                  className="input"
                  placeholder="Ej: REF-123456"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  setPaymentData({ metodo_pago: '', referencia: '' });
                }}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsPaid}
                disabled={markAsPaidMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {markAsPaidMutation.isPending ? 'Registrando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
