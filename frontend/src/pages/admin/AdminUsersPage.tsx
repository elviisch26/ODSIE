import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Users, Search, Edit2, Shield, UserCheck } from 'lucide-react';
import { ROLES } from '@/lib/constants';

interface User {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  role: string;
  account_status: string;
  especialidad?: string;
  registro_senescyt?: string;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [senescyt, setSenescyt] = useState('');
  const [especialidad, setEspecialidad] = useState('');

  // Obtener usuarios
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      if (searchTerm) {
        const { data } = await usersAPI.search(searchTerm);
        return data;
      }
      const { data } = await usersAPI.getAll();
      return data;
    },
  });

  // Mutation para actualizar usuario
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await usersAPI.update(id, updates);
    },
    onSuccess: () => {
      toast.success('Usuario actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      setNewRole('');
      setSenescyt('');
      setEspecialidad('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    },
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
    setSenescyt(user.registro_senescyt || '');
    setEspecialidad(user.especialidad || '');
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updates: any = {
      role: newRole,
    };

    // Si se cambia a DOCTOR, requerir SENESCYT
    if (newRole === ROLES.DOCTOR) {
      if (!senescyt) {
        toast.error('Los doctores requieren registro SENESCYT');
        return;
      }
      updates.registro_senescyt = senescyt;
      updates.especialidad = especialidad;
    }

    updateUserMutation.mutate({ id: editingUser.id, updates });
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      [ROLES.ADMINISTRADOR]: 'bg-purple-100 text-purple-800',
      [ROLES.DOCTOR]: 'bg-blue-100 text-blue-800',
      [ROLES.PACIENTE]: 'bg-green-100 text-green-800',
    };

    const icons = {
      [ROLES.ADMINISTRADOR]: <Shield className="w-3 h-3" />,
      [ROLES.DOCTOR]: <UserCheck className="w-3 h-3" />,
      [ROLES.PACIENTE]: <Users className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {icons[role as keyof typeof icons]}
        <span>{role}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">Administra roles y permisos de usuarios</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
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
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombres} {user.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.cedula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.account_status === 'ACTIVO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.account_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.especialidad || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center space-x-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Editar Usuario: {editingUser.nombres} {editingUser.apellidos}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="input"
                >
                  <option value={ROLES.PACIENTE}>Paciente</option>
                  <option value={ROLES.DOCTOR}>Doctor</option>
                  <option value={ROLES.ADMINISTRADOR}>Administrador</option>
                </select>
              </div>

              {newRole === ROLES.DOCTOR && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registro SENESCYT *
                    </label>
                    <input
                      type="text"
                      value={senescyt}
                      onChange={(e) => setSenescyt(e.target.value)}
                      className="input"
                      placeholder="Ej: 1234-SENESCYT-2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidad
                    </label>
                    <input
                      type="text"
                      value={especialidad}
                      onChange={(e) => setEspecialidad(e.target.value)}
                      className="input"
                      placeholder="Ej: Medicina General, Psicología, Enfermería"
                    />
                  </div>
                </>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Cambiar el rol de un usuario afectará sus permisos inmediatamente.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewRole('');
                  setSenescyt('');
                  setEspecialidad('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={updateUserMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {updateUserMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
