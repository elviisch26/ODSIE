import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, Download, RefreshCw, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { patientsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function PatientQRCodePage() {
  const user = useAuthStore((state: any) => state.user);
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: patientData, isLoading } = useQuery({
    queryKey: ['patient-profile', user?.patient?.id],
    queryFn: () => patientsAPI.getMe(),
    enabled: !!user?.patient?.id,
  });

  const patient = patientData?.data;

  const generateQRMutation = useMutation({
    mutationFn: () => patientsAPI.generateQR(user?.patient?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
      toast.success('Código QR generado exitosamente');
    },
    onError: () => {
      toast.error('Error al generar el código QR');
    },
  });

  const downloadQR = () => {
    if (patient?.qr_code_url) {
      const link = document.createElement('a');
      link.href = patient.qr_code_url;
      link.download = `qr-code-${user?.nombres}-${user?.apellidos}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Código QR descargado');
    }
  };

  const copyAccessLink = () => {
    const accessUrl = `${window.location.origin}/qr-access/${patient?.qr_access_token}`;
    navigator.clipboard.writeText(accessUrl);
    setCopied(true);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Código QR</h1>
        <p className="text-gray-600">
          Comparte tu código QR para acceso rápido a tu historial médico
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Código QR */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-6">
              <QrCode className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu Código QR Personal</h2>
            <p className="text-gray-600 mb-8">
              Úsalo para compartir tu información médica de forma segura
            </p>

            {patient?.qr_code_url ? (
              <div className="mb-6">
                <div className="inline-block p-4 bg-white border-4 border-blue-500 rounded-lg shadow-lg">
                  <img
                    src={patient.qr_code_url}
                    alt="Código QR"
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Este código QR es único y personal
                </p>
              </div>
            ) : (
              <div className="mb-6 p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <QrCode className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No tienes un código QR generado</p>
                <p className="text-sm text-gray-500 mt-2">
                  Haz clic en "Generar Código QR" para crear uno
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="space-y-3">
              {patient?.qr_code_url ? (
                <>
                  <button
                    onClick={downloadQR}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Descargar Código QR</span>
                  </button>
                  <button
                    onClick={() => generateQRMutation.mutate()}
                    disabled={generateQRMutation.isPending}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-5 w-5 ${generateQRMutation.isPending ? 'animate-spin' : ''}`}
                    />
                    <span>
                      {generateQRMutation.isPending ? 'Regenerando...' : 'Regenerar Código QR'}
                    </span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => generateQRMutation.mutate()}
                  disabled={generateQRMutation.isPending}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <QrCode className="h-5 w-5" />
                  <span>
                    {generateQRMutation.isPending ? 'Generando...' : 'Generar Código QR'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Información y enlace de acceso */}
        <div className="space-y-6">
          {/* Enlace de acceso */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LinkIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Enlace de Acceso Rápido</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              También puedes compartir este enlace directamente sin necesidad del código QR
            </p>
            {patient?.qr_access_token && (
              <>
                <div className="p-3 bg-gray-50 rounded border border-gray-200 mb-3">
                  <p className="text-sm font-mono text-gray-700 break-all">
                    {window.location.origin}/qr-access/{patient.qr_access_token}
                  </p>
                </div>
                <button
                  onClick={copyAccessLink}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Instrucciones de uso */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">¿Cómo usar tu código QR?</h3>
            <ol className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                  1
                </span>
                <span>
                  <strong>Descarga</strong> tu código QR usando el botón de descarga
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                  2
                </span>
                <span>
                  <strong>Imprime</strong> el código QR o guárdalo en tu teléfono móvil
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                  3
                </span>
                <span>
                  <strong>Compártelo</strong> con tu médico para que acceda rápidamente a tu
                  historial
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                  4
                </span>
                <span>
                  Recibirás una <strong>notificación por email</strong> cada vez que alguien acceda
                  a tu historia
                </span>
              </li>
            </ol>
          </div>

          {/* Seguridad */}
          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              🔒 Seguridad de tu información
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Tu código QR es único y está encriptado</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Puedes regenerarlo en cualquier momento si lo deseas</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Recibirás notificaciones de cada acceso a tu información</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Solo personal médico autorizado puede ver tu historial completo</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
