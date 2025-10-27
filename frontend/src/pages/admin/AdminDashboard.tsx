import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, DollarSign, FileText, Settings, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      description: 'Buscar, editar y administrar usuarios del sistema',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      route: '/dashboard/admin/users',
    },
    {
      id: 'activity',
      title: 'Logs de Actividad',
      description: 'Ver registros de acceso y actividades',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      route: '/dashboard/admin/activity',
    },
    {
      id: 'payments',
      title: 'Gestión de Pagos',
      description: 'Administrar pagos y suscripciones',
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      route: '/dashboard/admin/payments',
    },
    {
      id: 'records',
      title: 'Historias Clínicas',
      description: 'Ver todas las historias clínicas',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      route: '/dashboard/admin/records',
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      route: '/dashboard/admin/settings',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Pacientes</h3>
              <p className="text-4xl font-bold">150</p>
            </div>
            <Users className="w-12 h-12 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pagos Realizados</h3>
              <p className="text-4xl font-bold">120</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pagos Pendientes</h3>
              <p className="text-4xl font-bold">30</p>
            </div>
            <Shield className="w-12 h-12 opacity-50" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Personal Activo</h3>
              <p className="text-4xl font-bold">12</p>
            </div>
            <Activity className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Secciones de Administración */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Herramientas de Administración</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => navigate(section.route)}
                onMouseEnter={() => setActiveSection(section.id)}
                onMouseLeave={() => setActiveSection(null)}
                className={`card hover:shadow-lg transition-all duration-200 text-left ${
                  activeSection === section.id ? 'scale-105' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-600 text-sm">{section.description}</p>
                <div className="mt-4 text-primary-600 text-sm font-medium flex items-center">
                  Acceder →
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/dashboard/admin/users')}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Gestionar Usuarios</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/admin/activity')}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Activity className="w-5 h-5" />
            <span>Ver Actividad</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/admin/payments')}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <DollarSign className="w-5 h-5" />
            <span>Gestionar Pagos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
