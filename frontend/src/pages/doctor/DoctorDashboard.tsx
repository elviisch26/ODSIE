export default function DoctorDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel del Personal de Salud</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Pacientes</h3>
          <p className="text-gray-600">Buscar y gestionar pacientes</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Historias Clínicas</h3>
          <p className="text-gray-600">Crear y editar historias</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Mis Consultas</h3>
          <p className="text-gray-600">Ver mis consultas realizadas</p>
        </div>
      </div>
    </div>
  );
}
