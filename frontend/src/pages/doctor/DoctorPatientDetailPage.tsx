import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientsAPI, medicalRecordsAPI } from '@/lib/api';
import type { Patient, MedicalRecord } from '@/types';

export default function DoctorPatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientsAPI.getOne(patientId!);
      return response.data as Patient;
    },
    enabled: !!patientId,
  });

  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: async () => {
      const response = await medicalRecordsAPI.getByPatient(patientId!);
      return response.data as MedicalRecord[];
    },
    enabled: !!patientId,
  });

  if (loadingPatient || loadingRecords) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Paciente no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/dashboard/doctor/patients" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Volver a pacientes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {patient.user?.nombres} {patient.user?.apellidos}
          </h1>
          <p className="text-gray-500">Cédula: {patient.user?.cedula}</p>
        </div>
        <Link
          to={`/dashboard/doctor/patients/${patientId}/new-record`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva Historia Clínica
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del paciente */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Información Personal</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{patient.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Celular</p>
                <p className="text-gray-900">{patient.user?.celular || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                <p className="text-gray-900">
                  {patient.user?.fecha_nacimiento
                    ? new Date(patient.user.fecha_nacimiento).toLocaleDateString('es-EC')
                    : 'No registrada'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="text-gray-900">{patient.user?.direccion || 'No registrada'}</p>
              </div>
            </div>
          </div>

          {/* Información médica */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Información Médica</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Sangre</p>
                {patient.tipo_sangre ? (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {patient.tipo_sangre}
                  </span>
                ) : (
                  <p className="text-gray-400">No registrado</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Alergias</p>
                {patient.alergias && patient.alergias.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.alergias.map((alergia, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                      >
                        {alergia}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Ninguna registrada</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Enfermedades Crónicas</p>
                {patient.enfermedades_cronicas && patient.enfermedades_cronicas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.enfermedades_cronicas.map((enfermedad, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
                      >
                        {enfermedad}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Ninguna registrada</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Medicamentos Actuales</p>
                {patient.medicamentos_actuales && patient.medicamentos_actuales.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700">
                    {patient.medicamentos_actuales.map((medicamento, index) => (
                      <li key={index}>{medicamento}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Ninguno registrado</p>
                )}
              </div>
            </div>
          </div>

          {/* Contactos de emergencia */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Contactos de Emergencia</h2>
            {patient.contacto_emergencia_1 ? (
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="font-medium">{patient.contacto_emergencia_1.nombre}</p>
                  <p className="text-sm text-gray-500">{patient.contacto_emergencia_1.relacion}</p>
                  <p className="text-sm text-gray-600">{patient.contacto_emergencia_1.telefono}</p>
                </div>
                {patient.contacto_emergencia_2 && (
                  <div className="border-l-4 border-green-500 pl-3">
                    <p className="font-medium">{patient.contacto_emergencia_2.nombre}</p>
                    <p className="text-sm text-gray-500">{patient.contacto_emergencia_2.relacion}</p>
                    <p className="text-sm text-gray-600">{patient.contacto_emergencia_2.telefono}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Sin contactos de emergencia registrados</p>
            )}
          </div>
        </div>

        {/* Historias clínicas */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Historial de Consultas ({records?.length || 0})
            </h2>

            {records && records.length > 0 ? (
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(record.fecha_consulta).toLocaleDateString('es-EC', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Dr. {record.doctor?.nombres} {record.doctor?.apellidos}
                        </p>
                      </div>
                      {record.firma_digital && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          ✓ Firmado
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Motivo de consulta:</p>
                      <p className="text-gray-600">{record.motivo_consulta}</p>
                    </div>

                    {record.diagnostico && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Diagnóstico:</p>
                        <p className="text-gray-600">{record.diagnostico}</p>
                      </div>
                    )}

                    {record.tratamiento && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Tratamiento:</p>
                        <p className="text-gray-600">{record.tratamiento}</p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link
                        to={`/dashboard/doctor/records/${record.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver detalles completos →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin historias clínicas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Este paciente no tiene consultas registradas.
                </p>
                <div className="mt-6">
                  <Link
                    to={`/dashboard/doctor/patients/${patientId}/new-record`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Crear primera historia clínica
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
