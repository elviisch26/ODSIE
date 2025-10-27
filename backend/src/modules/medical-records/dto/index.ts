import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsUUID()
  patient_id: string;

  @IsString()
  motivo_consulta: string;

  @IsOptional()
  @IsString()
  sintomas?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  fecha_consulta?: string;
}

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsString()
  motivo_consulta?: string;

  @IsOptional()
  @IsString()
  sintomas?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class SignRecordDto {
  @IsString()
  firma_digital: string;
}
