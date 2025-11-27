import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { patientsAPI, medicalRecordsAPI } from '@/lib/api';
import type { Patient } from '@/types';

interface MedicalRecordForm {
  fecha_consulta: string;
  motivo_consulta: string;
  sintomas: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}

export default function DoctorNewRecordPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<MedicalRecordForm>({
    fecha_consulta: new Date().toISOString().slice(0, 16),
    motivo_consulta: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
  });

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientsAPI.getOne(patientId!);
      return response.data as Patient;
    },
    enabled: !!patientId,
  });

  const createMutation = useMutation({
    mutationFn: (data: MedicalRecordForm & { patient_id: string }) =>
      medicalRecordsAPI.create(data),
    onSuccess: () => {
      toast.success('Historia clínica creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['medical-records', patientId] });
      navigate(`/dashboard/doctor/patients/${patientId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la historia clínica');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.motivo_consulta.trim()) {
      toast.error('El motivo de consulta es requerido');
      return;
    }

    if (!formData.diagnostico.trim()) {
      toast.error('El diagnóstico es requerido');
      return;
    }

    createMutation.mutate({
      ...formData,
      patient_id: patientId!,
    });
  };

  if (isLoading) {
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/dashboard/doctor/patients/${patientId}`}
          className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
        >
          ← Volver al paciente
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Historia Clínica</h1>
        <p className="text-gray-500 mt-1">
          Paciente: {patient.user?.nombres} {patient.user?.apellidos} | Cédula: {patient.user?.cedula}
        </p>
      </div>

      {/* Alertas del paciente */}
      {(patient.alergias?.length || patient.enfermedades_cronicas?.length) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Información importante del paciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.alergias && patient.alergias.length > 0 && (
              <div>
                <p className="text-sm font-medium text-yellow-700">Alergias:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.alergias.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {patient.enfermedades_cronicas && patient.enfermedades_cronicas.length > 0 && (
              <div>
                <p className="text-sm font-medium text-yellow-700">Enfermedades crónicas:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.enfermedades_cronicas.map((e, i) => (
                    <span key={i} className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Fecha y hora */}
          <div>
            <label htmlFor="fecha_consulta" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora de la consulta *
            </label>
            <input
              type="datetime-local"
              id="fecha_consulta"
              name="fecha_consulta"
              value={formData.fecha_consulta}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Motivo de consulta */}
          <div>
            <label htmlFor="motivo_consulta" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de consulta *
            </label>
            <textarea
              id="motivo_consulta"
              name="motivo_consulta"
              value={formData.motivo_consulta}
              onChange={handleChange}
              rows={2}
              placeholder="¿Por qué acude el paciente a consulta?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Síntomas */}
          <div>
            <label htmlFor="sintomas" className="block text-sm font-medium text-gray-700 mb-1">
              Síntomas
            </label>
            <textarea
              id="sintomas"
              name="sintomas"
              value={formData.sintomas}
              onChange={handleChange}
              rows={3}
              placeholder="Describa los síntomas que presenta el paciente"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Diagnóstico */}
          <div>
            <label htmlFor="diagnostico" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnóstico *
            </label>
            <textarea
              id="diagnostico"
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleChange}
              rows={3}
              placeholder="Diagnóstico médico"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Tratamiento */}
          <div>
            <label htmlFor="tratamiento" className="block text-sm font-medium text-gray-700 mb-1">
              Tratamiento
            </label>
            <textarea
              id="tratamiento"
              name="tratamiento"
              value={formData.tratamiento}
              onChange={handleChange}
              rows={3}
              placeholder="Tratamiento prescrito, medicamentos, dosis, frecuencia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={2}
              placeholder="Notas adicionales, recomendaciones, próxima cita"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex justify-end gap-4">
          <Link
            to={`/dashboard/doctor/patients/${patientId}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createMutation.isPending ? 'Guardando...' : 'Guardar Historia Clínica'}
          </button>
        </div>
      </form>
    </div>
  );
}
