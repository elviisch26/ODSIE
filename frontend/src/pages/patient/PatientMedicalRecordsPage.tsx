import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Calendar, User, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { medicalRecordsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PatientMedicalRecordsPage() {
  const user = useAuthStore((state: any) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patient-medical-records', user?.patient?.id],
    queryFn: () => medicalRecordsAPI.getByPatient(user?.patient?.id || ''),
    enabled: !!user?.patient?.id,
  });

  const records = data?.data || [];

  const filteredRecords = records.filter((record: any) =>
    record.motivo_consulta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctor?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRecord = (id: string) => {
    setExpandedRecord(expandedRecord === id ? null : id);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Historia Clínica</h1>
        <p className="text-gray-600">Consulta tus registros médicos</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por motivo, diagnóstico o doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total de Registros</span>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{records.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Última Consulta</span>
            <Calendar className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {records.length > 0
              ? format(new Date(records[0].fecha_consulta), 'dd MMM yyyy', { locale: es })
              : 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Registros Firmados</span>
            <User className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {records.filter((r: any) => r.firma_digital).length}
          </p>
        </div>
      </div>

      {/* Lista de historias clínicas */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron registros' : 'No tienes historias clínicas'}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Cuando tu médico cree registros aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record: any) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Encabezado del registro */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleRecord(record.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {record.motivo_consulta}
                      </h3>
                      {record.firma_digital && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Firmado
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(record.fecha_consulta), "dd 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Dr. {record.doctor?.nombres} {record.doctor?.apellidos}
                      </div>
                    </div>
                  </div>
                  {expandedRecord === record.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Detalles expandidos */}
              {expandedRecord === record.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {record.sintomas && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Síntomas</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {record.sintomas}
                        </p>
                      </div>
                    )}

                    {record.diagnostico && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Diagnóstico</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {record.diagnostico}
                        </p>
                      </div>
                    )}

                    {record.tratamiento && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Tratamiento</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {record.tratamiento}
                        </p>
                      </div>
                    )}

                    {record.observaciones && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Observaciones
                        </h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {record.observaciones}
                        </p>
                      </div>
                    )}
                  </div>

                  {record.firma_digital && (
                    <div className="mt-6 pt-6 border-t border-gray-300">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          <span className="font-semibold">Firmado por:</span>{' '}
                          {record.firmado_por || `Dr. ${record.doctor?.nombres} ${record.doctor?.apellidos}`}
                        </div>
                        {record.fecha_firma && (
                          <div className="text-gray-600">
                            <span className="font-semibold">Fecha de firma:</span>{' '}
                            {format(new Date(record.fecha_firma), "dd/MM/yyyy 'a las' HH:mm", {
                              locale: es,
                            })}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Firma Digital:</p>
                        <p className="text-xs font-mono text-gray-700 break-all">
                          {record.firma_digital}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
