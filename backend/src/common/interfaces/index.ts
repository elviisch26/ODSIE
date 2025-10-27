export interface EmergencyContact {
  nombre: string;
  relacion: string;
  telefono: string;
  email?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  fecha_nacimiento?: Date;
  direccion?: string;
  registro_senescyt?: string;
  especialidad?: string;
  account_status: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  id: string;
  user_id: string;
  alergias?: string[];
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string[];
  contacto_emergencia_1?: EmergencyContact;
  contacto_emergencia_2?: EmergencyContact;
  contacto_emergencia_3?: EmergencyContact;
  qr_code_url?: string;
  qr_access_token: string;
  created_at: Date;
  updated_at: Date;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  fecha_consulta: Date;
  motivo_consulta: string;
  sintomas?: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  firma_digital?: string;
  firmado_por?: string;
  fecha_firma?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MedicalFile {
  id: string;
  patient_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  file_type: string;
  folder: string;
  description?: string;
  created_at: Date;
}

export interface Payment {
  id: string;
  patient_id: string;
  mes: number;
  anio: number;
  monto: number;
  fecha_pago?: Date;
  status: string;
  metodo_pago?: string;
  referencia?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  patient_id?: string;
  accion: string;
  descripcion?: string;
  ip_address?: string;
  ubicacion?: string;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  created_at: Date;
}
