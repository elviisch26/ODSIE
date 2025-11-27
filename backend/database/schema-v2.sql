-- ODSIE Database Schema ACTUALIZADO - Supabase
-- Sistema de Historias Clínicas Digitales
-- Versión 2.0 - Solo 3 Roles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS (ACTUALIZADOS - SOLO 3 ROLES)
-- =============================================

CREATE TYPE user_role AS ENUM ('PACIENTE', 'DOCTOR', 'ADMINISTRADOR');
CREATE TYPE payment_status AS ENUM ('PENDIENTE', 'PAGADO', 'ATRASADO');
CREATE TYPE file_type AS ENUM ('SINTOMA', 'RECETA', 'EXAMEN', 'IMAGEN_MEDICA');
CREATE TYPE account_status AS ENUM ('ACTIVO', 'BLOQUEADO', 'SUSPENDIDO');

-- =============================================
-- TABLES
-- =============================================

-- Tabla de Usuarios (Pacientes y Personal de Salud)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PACIENTE',
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    celular VARCHAR(20),
    fecha_nacimiento DATE,
    direccion TEXT,
    registro_senescyt VARCHAR(100),
    especialidad VARCHAR(255),
    account_status account_status DEFAULT 'ACTIVO',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_doctor_senescyt CHECK (
        role != 'DOCTOR' OR registro_senescyt IS NOT NULL
    )
);

-- Tabla de Pacientes (Información Médica)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo_sangre VARCHAR(5),
    alergias TEXT[],
    enfermedades_cronicas TEXT[],
    medicamentos_actuales TEXT[],
    contacto_emergencia_1 JSONB,
    contacto_emergencia_2 JSONB,
    qr_code_url TEXT,
    qr_access_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Historias Clínicas
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id),
    fecha_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
    motivo_consulta TEXT NOT NULL,
    sintomas TEXT,
    diagnostico TEXT NOT NULL,
    tratamiento TEXT,
    observaciones TEXT,
    firma_digital TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Archivos Médicos
CREATE TABLE medical_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_type file_type NOT NULL,
    folder VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Pagos Mensuales
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INTEGER NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    status payment_status DEFAULT 'PENDIENTE',
    metodo_pago VARCHAR(100),
    referencia VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, mes, anio)
);

-- Tabla de Notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Logs de Actividad
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ip_address VARCHAR(50),
    ubicacion VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cedula ON users(cedula);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_qr_token ON patients(qr_access_token);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_fecha ON medical_records(fecha_consulta);
CREATE INDEX idx_medical_files_patient ON medical_files(patient_id);
CREATE INDEX idx_medical_files_type ON medical_files(file_type);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_leido ON notifications(leido);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_patient ON activity_logs(patient_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_files_updated_at BEFORE UPDATE ON medical_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_logs_updated_at BEFORE UPDATE ON activity_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Políticas para patients
CREATE POLICY "Patients can view own data"
  ON patients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Patients can update own data"
  ON patients FOR UPDATE
  USING (user_id = auth.uid());

-- Políticas para medical_records
CREATE POLICY "Patients can view own records"
  ON medical_records FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Políticas para medical_files
CREATE POLICY "Patients can view own files"
  ON medical_files FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Políticas para payments
CREATE POLICY "Patients can view own payments"
  ON payments FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Políticas para notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Políticas para activity_logs
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- =============================================
-- POLÍTICAS PARA DOCTORES
-- =============================================

-- Doctores pueden ver todos los usuarios (para buscar pacientes)
CREATE POLICY "Doctors can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'DOCTOR'
    )
  );

-- Doctores pueden ver todos los pacientes
CREATE POLICY "Doctors can view all patients"
  ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'DOCTOR'
    )
  );

-- Doctores pueden ver todas las historias clínicas
CREATE POLICY "Doctors can view all medical records"
  ON medical_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'DOCTOR'
    )
  );

-- Doctores pueden crear historias clínicas
CREATE POLICY "Doctors can create medical records"
  ON medical_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'DOCTOR'
    )
    AND doctor_id = auth.uid()
  );

-- Doctores pueden actualizar historias clínicas que ellos crearon
CREATE POLICY "Doctors can update own medical records"
  ON medical_records FOR UPDATE
  USING (doctor_id = auth.uid());

-- Doctores pueden ver todos los archivos médicos
CREATE POLICY "Doctors can view all medical files"
  ON medical_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'DOCTOR'
    )
  );

-- Doctores pueden subir archivos médicos
CREATE POLICY "Doctors can upload medical files"
  ON medical_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'DOCTOR'
    )
    AND uploaded_by = auth.uid()
  );

-- Doctores pueden ver logs de actividad de sus pacientes
CREATE POLICY "Doctors can view patient activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'DOCTOR'
    )
  );

-- =============================================
-- POLÍTICAS PARA ADMINISTRADORES (ACCESO TOTAL)
-- =============================================

-- Administradores pueden ver todos los usuarios
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden crear usuarios
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden actualizar usuarios
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden eliminar usuarios
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden gestionar todos los pacientes
CREATE POLICY "Admins can manage all patients"
  ON patients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden gestionar todas las historias clínicas
CREATE POLICY "Admins can manage all medical records"
  ON medical_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden gestionar todos los archivos médicos
CREATE POLICY "Admins can manage all medical files"
  ON medical_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden gestionar todos los pagos
CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden gestionar todas las notificaciones
CREATE POLICY "Admins can manage all notifications"
  ON notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- Administradores pueden ver todos los logs de actividad
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMINISTRADOR'
    )
  );

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Crear usuario administrador inicial
-- Email: admin@odsie.com
-- Contraseña: Admin123!
INSERT INTO users (
  email, 
  password_hash, 
  role, 
  cedula, 
  nombres, 
  apellidos, 
  celular,
  account_status,
  email_verified
) VALUES (
  'admin@odsie.com',
  '$2b$10$rX8eQvVJXKGqYfN9yJ5V4eU3mYNvCYvKGqhGYpZxWXvCqPQYJN8YK',
  'ADMINISTRADOR',
  '0000000000',
  'Administrador',
  'Sistema',
  '0999999999',
  'ACTIVO',
  true
);

-- =============================================
-- MENSAJE FINAL
-- =============================================

SELECT 
  '✅ Base de datos ODSIE creada exitosamente' as mensaje,
  '3 roles configurados: PACIENTE, DOCTOR, ADMINISTRADOR' as roles,
  'Email: admin@odsie.com' as admin_email,
  'Contraseña: Admin123!' as admin_password,
  '⚠️ CAMBIAR CONTRASEÑA INMEDIATAMENTE' as advertencia;
