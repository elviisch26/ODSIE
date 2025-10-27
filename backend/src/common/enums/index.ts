export enum UserRole {
  PACIENTE = 'PACIENTE',
  DOCTOR = 'DOCTOR',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

export enum AccountStatus {
  ACTIVO = 'ACTIVO',
  BLOQUEADO = 'BLOQUEADO',
  SUSPENDIDO = 'SUSPENDIDO',
}

export enum PaymentStatus {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  ATRASADO = 'ATRASADO',
}

export enum FileType {
  SINTOMA = 'SINTOMA',
  RECETA = 'RECETA',
  EXAMEN = 'EXAMEN',
  IMAGEN_MEDICA = 'IMAGEN_MEDICA',
}

export const HEALTH_PROFESSIONAL_ROLES = [
  UserRole.DOCTOR,
];

export const CAN_EDIT_MEDICAL_RECORDS = [UserRole.DOCTOR, UserRole.ADMINISTRADOR];
