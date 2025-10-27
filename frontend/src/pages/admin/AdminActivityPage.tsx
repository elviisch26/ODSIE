import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityLogsAPI } from '@/lib/api';
import { Activity, Search, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  user_id: string;
  patient_id?: string;
  accion: string;
  descripcion: string;
  ip_address?: string;
  ubicacion?: string;
  created_at: string;
  user?: {
    nombres: string;
    apellidos: string;
    email: string;
    role: string;
  };
}

export default function AdminActivityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Obtener logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data } = await activityLogsAPI.getAll();
      return data;
    },
  });

  // Filtrar logs
  const filteredLogs = logs.filter((log: ActivityLog) => {
    const matchesSearch = 
      log.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.includes(searchTerm);

    const matchesType = filterType === 'all' || log.accion === filterType;

    return matchesSearch && matchesType;
  });

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      LOGIN: User,
      VER_HISTORIA: FileText,
      CREAR_HISTORIA: FileText,
      EDITAR_HISTORIA: FileText,
      default: Activity,
    };
    const Icon = icons[action] || icons.default;
    return <Icon className="w-5 h-5" />;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      LOGIN: 'bg-blue-100 text-blue-800',
      VER_HISTORIA: 'bg-green-100 text-green-800',
      CREAR_HISTORIA: 'bg-purple-100 text-purple-800',
      EDITAR_HISTORIA: 'bg-yellow-100 text-yellow-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colors[action] || colors.default;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Logs de Actividad</h1>
        <p className="text-gray-600 mt-2">Historial completo de acciones en el sistema</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por descripción, usuario, email o IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input"
          >
            <option value="all">Todas las acciones</option>
            <option value="LOGIN">Inicios de sesión</option>
            <option value="VER_HISTORIA">Ver historias</option>
            <option value="CREAR_HISTORIA">Crear historias</option>
            <option value="EDITAR_HISTORIA">Editar historias</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Total de Logs</h3>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
            <Activity className="w-8 h-8 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Logs Hoy</h3>
              <p className="text-2xl font-bold">
                {logs.filter((log: ActivityLog) => 
                  new Date(log.created_at).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Inicios de Sesión</h3>
              <p className="text-2xl font-bold">
                {logs.filter((log: ActivityLog) => log.accion === 'LOGIN').length}
              </p>
            </div>
            <User className="w-8 h-8 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Acciones Médicas</h3>
              <p className="text-2xl font-bold">
                {logs.filter((log: ActivityLog) => 
                  ['VER_HISTORIA', 'CREAR_HISTORIA', 'EDITAR_HISTORIA'].includes(log.accion)
                ).length}
              </p>
            </div>
            <FileText className="w-8 h-8 opacity-50" />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No se encontraron registros</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP / Ubicación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log: ActivityLog) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {log.user?.nombres} {log.user?.apellidos}
                        </div>
                        <div className="text-gray-500">{log.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.accion)}`}>
                        {getActionIcon(log.accion)}
                        <span>{log.accion.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {log.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{log.ip_address || '-'}</div>
                      <div className="text-xs text-gray-400">{log.ubicacion || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
