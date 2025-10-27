export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ROLES = {
  PACIENTE: 'PACIENTE',
  DOCTOR: 'DOCTOR',
  ADMINISTRADOR: 'ADMINISTRADOR',
} as const;

export const FILE_TYPES = {
  SINTOMA: 'SINTOMA',
  RECETA: 'RECETA',
  EXAMEN: 'EXAMEN',
  IMAGEN_MEDICA: 'IMAGEN_MEDICA',
} as const;

export const PAYMENT_STATUS = {
  PENDIENTE: 'PENDIENTE',
  PAGADO: 'PAGADO',
  ATRASADO: 'ATRASADO',
} as const;
